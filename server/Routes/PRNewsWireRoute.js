const PRNewsWireRoute = (app) => {
  const prnewswire = require("../controllers/prnewswire.controller");
  var router = require("express").Router();

  // Get all PRNewsWire details
  router.get("/pr-news-wire", prnewswire.getAllPRNewsWire);

  // Delete PRNewsWire details
  router.delete(
    "/pr-news-wire/deleteall",
    prnewswire.deletePRNewsWireAll
  );

  app.use("/api", router);
};
module.exports = PRNewsWireRoute;
