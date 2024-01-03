const mongoose = require("mongoose");

const BusinessWireSchema = new mongoose.Schema({
  tickerSymbol: String,
  firmIssuing: String,
  serviceIssuedOn: String,
  dateIssued: Date,
  urlToRelease: String,
});

module.exports = mongoose.model("business-wire", BusinessWireSchema);