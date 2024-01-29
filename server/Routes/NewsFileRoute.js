const NewsFileRoute = (app) => {
  const newsfilewire = require("../controllers/newsfile.controller");
  var router = require("express").Router();

  // Get all PRNewsWire details
  router.get("/news-files", newsfilewire.getAllNewsFile);

  // Delete PRNewsWire details
  router.delete("/news-files/deleteall", newsfilewire.deleteNewsFile);

  app.use("/api", router);
};
module.exports = NewsFileRoute;
