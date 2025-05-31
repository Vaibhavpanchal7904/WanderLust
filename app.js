if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
console.log(process.env.CLOUD_NAME, process.env.CLOUD_API_KEY, process.env.CLOUD_API_SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // Used to create layouts
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js")
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js")
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB!");
    })
    .catch(err => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions={
    secret:"mysupersecreatcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        
    },
};

/*app.get("/", (req, res) => {
    res.send("root");
});*/

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    console.log("Flash Success:", req.flash("success")); // Logs success messages
    //console.log("Flash Error:", req.flash("error"));     // Logs error messages
    res.locals.currUser=req.user;
    next();
});


app.use((req,res,next)=>{
    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;

    // Clear the messages from session
    delete req.session.success;
    delete req.session.error;

    next();
    
})


app.get("/demouser", async(req, res) => {
    let fakeuser=new User({
        email:"xyz@gmail.com",
        username:"vaibhavaaa1"
    })
    let registereduser=await User.register(fakeuser,"hi");
    res.send(registereduser);
});


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"))
});
app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
    
    //res.status(statusCode).send(message);
})

// Start the server
app.listen(8080, () => {
    console.log("Listening on port 8080");
});
