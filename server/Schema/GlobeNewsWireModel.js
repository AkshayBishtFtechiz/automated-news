const mongoose = require("mongoose");

const GlobeNewsWireSchema = new mongoose.Schema({
  tickerSymbol: String,
  firmIssuing: String,
  serviceIssuedOn: String,
  dateTimeIssued: String,
  urlToRelease: String,
  tickerIssuer: String,
});

module.exports = mongoose.model("globe-news-wire", GlobeNewsWireSchema);