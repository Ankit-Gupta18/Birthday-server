
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const details = require('./model');
const Mailgen = require('mailgen');
const nodemailer = require('nodemailer');

const app = express();
const port = 8000 || process.env.PORT;
require('dotenv').config();

// Intlizing all the libraries
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post("/send-email", async (req, res) => {
    const { recipientEmail, name } = req.body;
    
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const transporter = nodemailer.createTransport({

            host: 'smtp.gmail.com',
            port: 587,
            secure:false,

            auth: {
                user: process.env.EMAIL, // Replace with your email
                pass: process.env.PASSWORD, // Replace with your email password
            },
        });

        let MailGenerator = new Mailgen({
            theme: "cerberus",
            product: {
                name: "Say Happy Birthday",
                link: '#'
            }
        });

        let mail = MailGenerator.generate({ body: {
            name: name,
            intro: "Your prompt RSVP is greatly appreciated, and we are thrilled that you will be able to join us in celebrating this special occasion.",
            action:{
                instructions:["Please be present on 30 Aug, 2023 at 11:50 PM IST",
                                "Join the meet link on time."],
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Meeting Link',
                    link: 'https://meet.google.com/zno-dbwm-dns'
                }

            },
            outro: "Looking forward to meet you at scheduled time."
          } });

        
        const guest = await details.findOne({
            email: recipientEmail
        });
        if(!guest){
            await details.create({
                name: name,
                email: recipientEmail
            });
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: recipientEmail,
            subject: 'Birthday RSVPed',
            html: mail,
        });

        // If both updates are successful, commit the transaction
        await session.commitTransaction();
        session.endSession();

        // console.log('Email sent:', info.response);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
        // If any error occurs during the updates, rollback the transaction
        await session.abortTransaction();
        session.endSession();
        console.error('Error sending email:', err);
        res.status(500).json({ success: false, error: 'Error sending email' });
    }
})

// Connecting to MongoDB
mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then((success) => {
//   console.log("mongodb connected");

  app.listen(port, () => {
    // console.log(`server is running on ${port}`);
  });
}).catch((err) => {
//   console.log(`Error occurred while Connecting ${err}`);
});
