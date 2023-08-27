const mongoose=require('mongoose');

const details=new mongoose.Schema({

    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
        required:true
    }
}, 
{
    collection: 'info'
});



module.exports=mongoose.model('info', details);