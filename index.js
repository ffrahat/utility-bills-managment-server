const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;





// Middle Ware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Your Assingment Server is Running!");
});




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simplecrud.h04rjld.mongodb.net/?appName=SimpleCrud`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    client.db("admin").command({ ping: 1 });
    console.log("Your Server is Conected To The MongoDB Database");
    const db = client.db("utility_bill_managment");
    const userPendingBillsCollection = db.collection("pending_bills");

    // All Bills
    app.get("/all-bills", async (req, res) => {
      const cursor = userPendingBillsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Recent Bills
    app.get("/recent-bills", async (req, res) => {
      const projection = {title : 1 , category: 1, location: 1, created_at: 1}
      const cursor = userPendingBillsCollection.find({}, {projection}).sort({created_at: -1}).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });


    // Id Wise Data 
    app.get('/bill-details/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userPendingBillsCollection.findOne(query);
      res.send(result);
    })

    app.post("/all-bills", async(req, res) => {
      const newBills = req.body;
      const result = await userPendingBillsCollection.insertOne(newBills);
      res.send(result);
    });
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

// Port Listen
app.listen(port, () => {
  console.log("Your Server is Runnig Port : ", port);
});
