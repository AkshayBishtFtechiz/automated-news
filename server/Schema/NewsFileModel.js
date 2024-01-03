const mongoose = require("mongoose");

const NewsFileSchema = new mongoose.Schema({
  tickerSymbol: String,
  firmIssuing: String,
  serviceIssuedOn: String,
  dateIssued: Date,
  urlToRelease: String,
});

module.exports = mongoose.model("news-files", NewsFileSchema);