require('dotenv').config();
// Connect to your MongoDB server
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_URI; // replace with your MongoDB connection URI
const client = new MongoClient(uri);

// Connect to the database and delete all documents in the business-wire collection
client.connect(err => {
  if (err) throw err;
  
  const database = client.db('test'); // replace with your database name
  const collection = database.collection('business-wires');

  console.log(collection);
  
  collection.deleteMany({}, (deleteErr, result) => {
    if (deleteErr) throw deleteErr;
    console.log(`${result.deletedCount} documents deleted`);
    
    // Close the MongoDB connection
    client.close();
  });
});