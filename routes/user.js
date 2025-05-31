/*const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userConroller=require("../controllers/users.js")
// GET /signup - Render signup page
router.get("/signup",userConroller.renderSignForm );

// POST /signup - Handle signup
router.post("/signup", wrapAsync(userConroller.signUp));


// GET /login - Render login page
router.get("/login" ,userConroller.renderLoginForm);

// POST /login - Handle login
router.post("/login",saveRedirectUrl, passport.authenticate('local', {
    failureRedirect: '/login', // If login fails, redirect to login page
    failureFlash: true          // Optional: Flash a failure message on failure
}), (req, res) => {
    req.session.success = 'You have successfully logged in!';
    const redirectUrl = res.locals.redirectUrl || '/listings';  // Redirect to the intended page or default
    res.redirect(redirectUrl);
});

//logout
router.get("/logout",userConroller.logout)

module.exports = router;*/
const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

// Signup route
router
  .route("/signup")
  .get(userController.renderSignForm)       // GET /signup - Render signup page
  .post(wrapAsync(userController.signUp));  // POST /signup - Handle signup

// Login route
router
  .route("/login")
  .get(userController.renderLoginForm)     // GET /login - Render login page
  .post(
    saveRedirectUrl,
    passport.authenticate('local', {
      failureRedirect: '/login', // If login fails, redirect to login page
      failureFlash: true          // Optional: Flash a failure message on failure
    }),
    (req, res) => {
      req.session.success = 'You have successfully logged in!';
      const redirectUrl = res.locals.redirectUrl || '/listings';  // Redirect to the intended page or default
      res.redirect(redirectUrl);
    }
  );

// Logout route
router.get("/logout", userController.logout);  // GET /logout - Handle logout

module.exports = router;
