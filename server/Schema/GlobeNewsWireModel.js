const mongoose = require("mongoose");

const GlobeNewsWireSchema = new mongoose.Schema({
  firm: String,
  payload: {
    tickerSymbol: String,
    firmIssuing: String,
    serviceIssuedOn: String,
    dateTimeIssued: String,
    urlToRelease: String,
    tickerIssuer: String,
  }
});

module.exports = mongoose.model("globe-news-wire", GlobeNewsWireSchema);