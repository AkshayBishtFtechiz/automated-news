const mongoose = require("mongoose");

const PRNewsWireSchema = new mongoose.Schema({
  tickerSymbol: String,
  firmIssuing: String,
  serviceIssuedOn: String,
  dateIssued: Date,
  urlToRelease: String,
});

module.exports = mongoose.model("pr-news-wire", PRNewsWireSchema);
