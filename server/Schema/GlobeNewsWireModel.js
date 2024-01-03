const mongoose = require("mongoose");

const GlobeNewsWireSchema = new mongoose.Schema({
  tickerSymbol: String,
  firmIssuing: String,
  serviceIssuedOn: String,
  dateIssued: Date,
  urlToRelease: String,
});

module.exports = mongoose.model("globe-news-wire", GlobeNewsWireSchema);