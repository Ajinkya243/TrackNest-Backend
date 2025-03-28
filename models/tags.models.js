const mongoose=require('mongoose');

const tagsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Tag name is required'],
        unique:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const Tags=mongoose.model('Tags',tagsSchema);
module.exports={Tags}