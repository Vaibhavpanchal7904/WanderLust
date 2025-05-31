const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer  = require('multer')
const nodemailer = require("nodemailer");
const {storage}=require("../cloudConfig.js")
const upload = multer({storage});
const listingController = require("../controllers/listings.js");

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
     validateListing,
    wrapAsync(listingController.createListing)
  );


  router.get("/new", isLoggedIn, listingController.renderNewform);
  router.get("/filter/:id", wrapAsync(listingController.filter));
  router.get("/search", listingController.search);

  router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Reserve a slot
router.post(
  "/:id/reserve",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const { date, time } = req.body.reservation;

    // Simulate reservation process (e.g., storing in a log, sending an email, etc.)
    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: `Reservation Confirmation for ${listing.title}`,
      text: `Dear ${req.user.username},\n\nYou have successfully reserved a slot for "${listing.title}" on ${date} at ${time}.\n\nThank you for choosing us!`,
    });

    req.session.success=
      `Reservation successful! You reserved "${listing.title}" for ${date} at ${time}. A confirmation email has been sent to your registered email address.`
    ;
    res.redirect(`/listings/${listing._id}`);
  })
);

module.exports = router;
