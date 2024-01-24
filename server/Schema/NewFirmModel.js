const mongoose = require("mongoose");

const NewFirmsWireSchema = new mongoose.Schema({
  firmName: String,
  index: Number,
  newsWire: String,
});

module.exports = mongoose.model("new-firm-wires-news", NewFirmsWireSchema);
