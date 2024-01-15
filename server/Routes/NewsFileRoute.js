const NewsFileRoute = (app) => {
  const prnewswire = require("../controllers/newsfile.controller");
  var router = require("express").Router();

  // Get all PRNewsWire details
  router.get("/news-files", prnewswire.getAllNewsFile);

  // Delete PRNewsWire details
  router.delete("/news-files/deleteall", prnewswire.deleteNewsFile);

  app.use("/api", router);
};
module.exports = NewsFileRoute;
