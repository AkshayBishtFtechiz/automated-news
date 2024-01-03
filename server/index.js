require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const PORT = 5000 || process.env.PORT;
const MongoURI = process.env.MONGO_URI;
const BusinessWireRoute = require("./Routes/BusinessWireRoute");
const PRNewsWireRoute = require("./Routes/PRNewsWireRoute");
const NewsFilesRoute = require("./Routes/NewsFileRoute");
const GlobeNewsWireRoute = require("./Routes/GlobeNewsWireRoute");

app.use(cors());
app.use(express.json());

app.use("/business-wire", BusinessWireRoute);
app.use("/pr-news-wire", PRNewsWireRoute);
app.use("/news-files", NewsFilesRoute);
app.use("/globe-news-wire", GlobeNewsWireRoute);

// Database connection
const connection = mongoose.connect(MongoURI);
connection
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log("Database not connected!", error);
  });

// Database connection Ends

app.listen(PORT, () => console.log(`Listening to PORT: ${PORT}`));
