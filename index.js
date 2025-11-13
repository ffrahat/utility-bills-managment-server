const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;




const admin = require("firebase-admin");
//const serviceAccount = require("path/to/serviceAccountKey.json");

//Decoded
const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEY, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});






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
    // client.db("admin").command({ ping: 1 });
    console.log("Your Server is Conected To The MongoDB Database");
    const db = client.db("utility_bill_managment");
    const userPendingBillsCollection = db.collection("pending_bills");
    const submitedBillsCollection = db.collection("submited_bills");




app.get("/all-bills", async (req, res) => {
  const category = req.query.category;

  let query = {};
  if (category && category !== "all-bills") {
    query.category = { $regex: `^${category}$`, $options: "i" }; // i = ignore case
  }

  const result = await userPendingBillsCollection.find(query).toArray();
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
    app.get('/bill-details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userPendingBillsCollection.findOne(query);
      res.send(result);
    });

    app.post('/submited-bills', async(req, res) => {
      const newSubmitedBills = req.body;
      const result = await submitedBillsCollection.insertOne(newSubmitedBills);
      res.send(result)
    })


    // My Submited Bills

    app.get('/submited-bills', async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = submitedBillsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })




    app.delete('/submited-bills/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await submitedBillsCollection.deleteOne(query);
      res.send(result)

    })


    // app.get('/submited-bills', async (req, res) => {
    //   const cursor = submitedBillsCollection.find();
    //   const  result = await cursor.toArray();
    //   res.send(result)
    // })




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
