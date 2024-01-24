const NewFirmWireRoute = (app) => {
    const newfirmwire = require("../controllers/newfirmwire.controller");
    var router = require("express").Router();
  
    // Create New Firm Wire
    router.post("/new-firm-news-wire", newfirmwire.createNewFirmWire);

    // Delete New Firm Wire
    router.delete("/new-firm-news-wire/deleteall", newfirmwire.deleteNewFirmWire);
    
    app.use("/api", router);
  };
  module.exports = NewFirmWireRoute;
  