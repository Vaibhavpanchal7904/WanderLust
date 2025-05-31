const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session=require("express-session");
const sessionOption={
    secret:"mysupersecreatstring",
    resave:false,
    saveUninitialized:true,
}
app.use(session(sessionOption))
/*app.get("/request",(req,res)=>{
    if(req.session.count){
        req.session.count++;
    }else{
        req.session.count=1;
    }
   
    res.send(`send ${req.session.count} time`);
})*/

app.get("/register",(req,res)=>{
    let {name}=req.query;
    res.send(name);
})
/*app.get("/test",(req,res)=>{
    res.send("test successfully");
})*/
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
