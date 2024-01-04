const mongoose = require("mongoose");

const BusinessWireSchema = new mongoose.Schema({
  tickerSymbol: String,
  firmIssuing: String,
  serviceIssuedOn: String,
  dateTimeIssued: String,
  urlToRelease: String,
  tickerIssuer: String,
});

module.exports = mongoose.model("business-wire", BusinessWireSchema);