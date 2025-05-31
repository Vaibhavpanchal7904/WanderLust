const Listing=require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken }); 

module.exports.index=async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewform=async (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{
        path:"author",
    }}).populate("owner");
    if(!listing){
        req.session.error = 'Listing you requested for does not exists!';
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing=async (req, res,next) => {
    let response = await geoCodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
   
    //res.send("done");
    /*if(!req.body.listing){
        throw new ExpressError(404,"send valid data for listing");
    }*/
    let url=req.file.path;
    let filename=req.file.filename;
   
    const newListing = new Listing(req.body.listing);
    /*if(!newListing.description){
        throw new ExpressError(400,"discription missed!");
    }
    if(!newListing.title){
        throw new ExpressError(400,"title missed!");
    }
    if(!newListing.location){
        throw new ExpressError(400,"location missed!");
    }  //instead of using this bulky code we used joi tool*/
    
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
   let savedListing=await newListing.save();
   console.log(savedListing);
    req.session.success = 'Listing Creates!';
    res.redirect("/listings");

}

module.exports.renderEditForm=async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.session.error="listing you requested for does not exist";
        res.redirect("/listings");
    }
 
    let originalImageUrl = listing.image.url; 
        originalImageUrl= originalImageUrl.replace("upload", "/upload/w_250")
        res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let response = await geoCodingClient
    .forwardGeocode({
      query: ` ${req.body.listing.location},${req.body.listing.country}`,
      limit: 1,
    })
    .send();
    req.body.listing.geometry = response.body.features[0].geometry;
  let updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file!== undefined){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();}

    req.session.success = 'Listing updated successfully!';
    res.redirect(`/listings/${id}`);
}

module.exports.filter = async (req, res, next) => {
    let { id } = req.params;
    let allListings = await Listing.find({ category: { $all: [id] } });
    if (allListings.length != 0) {
      res.locals.success = `Listings Filtered by ${id}!`;
      res.render("listings/index.ejs", { allListings });
    } else {
      req.flash("error", `There is no any Listing for ${id}!`);
      res.redirect("/listings");
    }
  };

  module.exports.search = async (req, res) => {
  let input = req.query.q.trim().replace(/\s+/g, " ");
  if (input == "" || input == " ") {
    req.flash("error", "Please enter search query!");
    res.redirect("/listings");
  }

  let data = input.split("");
  let element = "";
  let flag = false;
  for (let index = 0; index < data.length; index++) {
    if (index == 0 || flag) {
      element = element + data[index].toUpperCase();
    } else {
      element = element + data[index].toLowerCase();
    }
    flag = data[index] == " ";
  }

  let allListings = await Listing.find({
    title: { $regex: element, $options: "i" },
  });
  if (allListings.length != 0) {
    res.locals.success = "Listings searched by Title!";
    res.render("listings/index.ejs", { allListings });
    return;
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      category: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Category!";
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }
  if (allListings.length == 0) {
    allListings = await Listing.find({
      country: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Country!";
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      location: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Location!";
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }

  const intValue = parseInt(element, 10);
  const intDec = Number.isInteger(intValue);

  if (allListings.length == 0 && intDec) {
    allListings = await Listing.find({ price: { $lte: element } }).sort({
      price: 1,
    });
    if (allListings.length != 0) {
      res.locals.success = `Listings searched by price less than Rs ${element}!`;
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }
  if (allListings.length == 0) {
    req.flash("error", "No listings found based on your search!");
    res.redirect("/listings");
  }
};


module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    console.log("Deleted!");
    res.redirect("/listings");
}