const NewFirmWireRoute = (app) => {
    const newfirmwire = require("../controllers/newfirmwire.controller");
    var router = require("express").Router();
  
    // Create New Firm Wire
    router.post("/new-firm-news-wire", newfirmwire.createNewFirmWire);

    // Delete New Firm Wire
    router.delete("/new-firm-news-wire/delete", newfirmwire.deleteNewFirmWire);

    // Delete All New Firm Wire
    router.delete("/new-firm-news-wire/deleteall", newfirmwire.deleteAllNewFirmWire);
    
    app.use("/api", router);
  };
  module.exports = NewFirmWireRoute;
  