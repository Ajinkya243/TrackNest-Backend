const mongoose=require('mongoose');
const {connectDB}=require('./db/db.connect')
require('dotenv').config();
const port=process.env.PORT;
const express=require('express');
const cors=require('cors');
const app=express();
app.use(express.json());
app.use(cors());
const {SalesAgent}=require('./models/salesAgent.models');
const {Lead} = require('./models/lead.models');
const {Comment}=require('./models/comment.models');
const {Tags} = require('./models/tags.models');

connectDB().then(()=>console.log('Database connected.')).then(()=>{
    app.listen(port,()=>{
        console.log('Express running port',port)
    })
})

const VALID_SOURCES = ["Referral", "Website", "Advertisement", "Cold Call","Email"];
const VALID_STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Closed"];
const VALID_PRIORITIES = ["High", "Medium", "Low"];

app.get("/",async(req,resp)=>{
    resp.send("Welcome to CRM Backend server")
})

// app.post("/agents",async(req,resp)=>{
//     try{
//         const agent=new SalesAgent(req.body);
//         await agent.save();
//         resp.json(agent);
//     }
//     catch(error){
//         throw Error(error);
//     }
// })

//Lead Api

app.post("/leads",async(req,resp)=>{
    try{
        const { name, source, salesAgent,budget, status, timeToClose, priority } = req.body;
        if (!name || typeof name !== "string") {
            return resp.status(400).json({ error: "Invalid input: 'name' is required and must be a string." });
        }
        if (!source || !VALID_SOURCES.includes(source)) {
            return resp.status(400).json({ error: `Invalid source. Allowed values: ${VALID_SOURCES.join(", ")}` });
        }
        if (salesAgent && !mongoose.Types.ObjectId.isValid(salesAgent)) {
            return resp.status(400).json({ error: "Invalid salesAgent ID." });
        }
        if (status && !VALID_STATUSES.includes(status)) {
            return resp.status(400).json({ error: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}` });
        }
        if (timeToClose !== undefined && (!Number.isInteger(timeToClose) || timeToClose <= 0)) {
            return resp.status(400).json({ error: "timeToClose must be a positive integer." });
        }
        if (priority && !VALID_PRIORITIES.includes(priority)) {
            return resp.status(400).json({ error: `Invalid priority. Allowed values: ${VALID_PRIORITIES.join(", ")}` });
        }
        const lead=new Lead(req.body);
        let newLead=await lead.save();
        newLead=await newLead.populate('salesAgent','id name');
        resp.status(201).json(newLead);
    }
    catch(error){
        throw Error(error);
    }
})

// app.post("/leads/:id/comments",async(req,resp)=>{
//     try{
//         const id=req.params.id;
//         const {author,commentText}=req.body;
//         const comment=await new Comment({lead:id,author,commentText});
//         comment.save();
//         let newComment=comment.populate('lead').populate('author')
//         resp.json(newComment);
//     }
//     catch(error){
//         throw Error(error);
//     }
// })

app.get("/leads",async(req,resp)=>{
    try{
        const {salesAgent, status, tags, source}=req.query;
        let filter={};
        
        if(salesAgent){
            filter.salesAgent=salesAgent;
        }
        if(status){
            filter.status=status;
        }
        if(source){
            filter.source=source;
        }
        if(tags){
            filter.tags={ $in: tags.split(",") };
        }
        const leads=await Lead.find(filter).populate('salesAgent','id name').select("id name source salesAgent status tags timeToClose priority createdAt");
        resp.json(leads);
    }
    catch(error){
        throw Error(error);
    }
})

app.get("/leads/:id",async(req,resp)=>{
    try{
        const id=req.params.id;
        const lead=await Lead.findById(id)
        resp.send(lead);
    }
    catch(error){
        throw Error(error)
    }
})

app.post("/leads/:id",async(req,resp)=>{
    try{
        const id=req.params.id;
        const { name, source, salesAgent, status, timeToClose, priority } = req.body;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return resp.status(400).json({ error: `Lead with ID ${id} not found.`});
        }
        if (!name || typeof name !== "string") {
            return resp.status(400).json({ error: "Invalid input: 'name' is required and must be a string." });
        }
        if (!source || !VALID_SOURCES.includes(source)) {
            return resp.status(400).json({ error: `Invalid source. Allowed values: ${VALID_SOURCES.join(", ")}` });
        }
        if (salesAgent && !mongoose.Types.ObjectId.isValid(salesAgent)) {
            return resp.status(400).json({ error: "Invalid salesAgent ID." });
        }
        if (status && !VALID_STATUSES.includes(status)) {
            return resp.status(400).json({ error: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}` });
        }
        if (timeToClose !== undefined && (!Number.isInteger(timeToClose) || timeToClose <= 0)) {
            return resp.status(400).json({ error: "timeToClose must be a positive integer." });
        }
        if (priority && !VALID_PRIORITIES.includes(priority)) {
            return resp.status(400).json({ error: `Invalid priority. Allowed values: ${VALID_PRIORITIES.join(", ")}` });
        }
        let updatedLead=await Lead.findByIdAndUpdate(id,req.body,{new:true});
        updatedLead=await updatedLead.populate('salesAgent','id name');
        resp.status(201).json(updatedLead);
    }
    catch(error){
        throw Error(error);
    }
})

app.delete("/leads/:id",async(req,resp)=>{
    try{
        const lead=await Lead.findByIdAndDelete(req.params.id);
        if(!lead){
            resp.status(404).json({message:`Lead with id ${req.params.id} not found.`})
        }
        resp.status(201).json({message:"Lead deleted succesfully",lead})
    }
    catch(error){
        throw Error(error.message);
    }
})

//Salesagent Api

app.post("/agents",async(req,resp)=>{
    try{
        const {name,email}=req.body;
        if(!name && typeof(name)!=='string'){
            return resp.status(400).json({ error: "Invalid input: 'name' is required and must be a string." });
        }
        if(!email && typeof(email) !=='string'){
            return resp.status(400).json({ error: "Invalid input: 'email' is required and must be a string." });
        }
        const existingAgent=await SalesAgent.findOne({email})
        if(existingAgent){
            resp.status(409).json({"error": `Sales agent with email ${email} already exists.`})
        }
        const agent=new SalesAgent(req.body);
        await agent.save();
        resp.status(201).json({message:'Agent added',agent})
    }
    catch(error){
        throw Error(error.message)
    }
})

app.get("/agents",async(req,resp)=>{
    try{
        const agents=await SalesAgent.find();
        resp.json(agents)
    }
    catch(error){
        throw Error(error.message);
    }
})
app.get("/agents/:id",async(req,resp)=>{
    try{
        const id=req.params.id;
        const agent=await SalesAgent.findById(id);
        resp.send(agent)
    }
    catch(error){
        throw Error(error);
    }
})

//comment api

app.post("/leads/:id/comments",async(req,resp)=>{
    try{
        const id=req.params.id;
        const {author,commentText}=req.body;
        const comment=new Comment({lead:id,author,commentText});
        await comment.save();
        let newComment=await comment.populate('author','name')
        resp.json(newComment);
    }
    catch(error){
        throw Error(error);
    }
})

app.get("/leads/:id/comments",async(req,resp)=>{
    try{
        const id=req.params.id;
        const comments=await Comment.find({lead:id}).populate('author','name');
        resp.json(comments);
    }
    catch(error){
        throw Error(error.message);
    }
})


//Report api
app.get("/report/last-week",async(req,resp)=>{
    try{
        const today=new Date();
        const lastWeek=new Date();
        lastWeek.setDate(today.getDate()-7);

        const leads=await Lead.find({status:'Closed',closedAt:{$gte:lastWeek,$lte:today}})
        resp.status(201).json({leads})
    }
    catch(error){
        throw Error(error.message)
    }
})

app.get("/report/pipeline",async(req,resp)=>{
    try{
        const totalLeads=await Lead.countDocuments({status:{$ne:'Closed'}})
        resp.status(201).json({totalLeads})
    }
    catch(error){
        throw Error(error);
    }
})
