const mongoose=require('mongoose');
require('dotenv').config();
const mongoUrl=process.env.MONGODB

const connectDB=async()=>{
    return await mongoose.connect(mongoUrl);
}

module.exports={connectDB}