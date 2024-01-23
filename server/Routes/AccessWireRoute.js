const AccessWireRoute = (app) => {
  const accessWire = require("../controllers/accesswire.controller.js");
  var router = require("express").Router();

  // Get all BusinessWire details
  router.get("/access-wire", accessWire.getAllAccessWire);

  // Delete Bussiness wire details
  router.delete("/access-wire/deleteall", accessWire.deleteAccessWireAll);

  app.use("/api", router);
};
module.exports = AccessWireRoute;
