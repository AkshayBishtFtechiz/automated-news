const GlobeNewsWireRoute = (app) => {
  const globenewswire = require("../controllers/globenewswire.controller");
  var router = require("express").Router();

  // Get all GlobeNewsWire details
  router.get("/globe-news-wire", globenewswire.getAllGlobeNewsWire);

  // Delete GlobeNewsWire details
  router.delete(
    "/globe-news-wire/deleteall",
    globenewswire.deleteGlobeNewsWireAll
  );

  app.use("/api", router);
};
module.exports = GlobeNewsWireRoute;
