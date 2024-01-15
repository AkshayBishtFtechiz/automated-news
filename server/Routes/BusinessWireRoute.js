const BusinessWireRoute = (app) => {
  const businessWire = require("../controllers/bussinesswire.controller.js");
  var router = require("express").Router();

  // Get all BusinessWire details
  router.get("/business-wire", businessWire.getAllBussinessWire);

  // Delete Bussiness wire details
  router.delete("/business-wire/deleteall", businessWire.deleteBussinessAll);

  app.use("/api", router);
};
module.exports = BusinessWireRoute;
