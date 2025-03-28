const mongoose=require('mongoose');

const commentSchema=new mongoose.Schema({
    lead:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Lead',
        required:[true,'Lead reference is required']
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'SalesAgent',
        required:[true,'Author is required']
    },
    commentText:{
        type:String,
        required:[true,'Comment is required']
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const Comment=mongoose.model('Comment',commentSchema);

module.exports={Comment}