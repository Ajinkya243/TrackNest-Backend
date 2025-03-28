const mongoose=require('mongoose');
const { SalesAgent } = require('./salesAgent.models');

const leadSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Lead name is required']
    },
    source:{
        type:String,
        required:[true,'lead source is required'],
        enum:['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other']
    },
    salesAgent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:SalesAgent,
        required:[true,'Sales agent is required']
    },
    budget:{
        type:Number,
        required:[true,'budget is required.']
    },
    status:{
        type:String,
        required:true,
        enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'],
        default:'New'
    },
    tags:{
        type:[String]
    },
    timeToClose:{
        type:Number,
        required:[true,'Time to Close is required'],
        min:[1,'Time to close must be a positive number']
    },
    priority:{
        type:String,
        required:true,
        enum:['High','Medium','Low'],
        default:'Medium'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    },
    closedAt:{
        type:Date
    }
})

leadSchema.pre('save',function(next){
    this.updatedAt=Date.now();
    next();
})

const Lead=mongoose.model('Lead',leadSchema);
module.exports={Lead}