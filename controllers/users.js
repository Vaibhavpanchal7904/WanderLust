const User = require("../models/user.js");

module.exports.renderSignForm=(req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signUp=async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        // The callback function for req.login should be defined as a function
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err); // Ensure you handle the error properly
            }
            req.session.success = 'Registration successful! You are now logged in.';
            res.redirect("/listings"); // Redirect after successful login
        });
    } catch (e) {
        console.log(e);
        res.redirect("/signup"); // In case of error, redirect back to signup page
    }
}

module.exports.renderLoginForm=(req, res) => {
    res.render("users/login.ejs");
}
module.exports.login=async(req, res) => {
    req.session.success = 'You have successfully logged in!';
    const redirectUrl = res.locals.redirectUrl || '/listings';  // Redirect to the intended page or default
    res.redirect(redirectUrl);
}

module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        res.redirect("/listings");
    })
}