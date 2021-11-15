const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmogq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("drone");
    const pakageCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const ratingCollection = database.collection("rating");
    const userCollection = database.collection("users");

    //GET Pakage API
    app.get("/products", async (req, res) => {
      const cursor = pakageCollection.find({});
      const pakages = await cursor.toArray();
      res.send(pakages);
    });

    // Post Pakage API

    app.post("/products", async (req, res) => {
      const pakage = req.body;
      console.log("hit the post api", pakage);
      const result = await pakageCollection.insertOne(pakage);
      console.log(result);
      res.json(result);
    });

    // GET Single Service
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific service", id);
      const query = { _id: ObjectId(id) };
      const pakage = await pakageCollection.findOne(query);
      res.json(pakage);
    });

    // POST ORDER API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      console.log("hit the post api", order);
      const result = await orderCollection.insertOne(order);
      console.log(result);
      res.json(result);
    });

    //GET Order API
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // DELETE API Manage Order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    // GET My Order
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      console.log("getting specific service", email);
      const result = await orderCollection.find({ email }).toArray();
      res.send(result);
    });

    // Post rating API
    app.post("/ratings", async (req, res) => {
      const rating = req.body;
      console.log("hit the rating api", rating);
      const result = await ratingCollection.insertOne(rating);
      console.log(result);
      res.json(result);
    });

    //GET Rating API
    app.get("/ratings", async (req, res) => {
      const cursor = ratingCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // Post User
    app.post("/addUserInfo", async (req, res) => {
      console.log(req.body);
      const result = await userCollection.insertOne(req.body);
      res.send(result);
      console.log(result);
    });
    app.put("/addUserInfo", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //make admin
    app.put("/makeAdmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await userCollection.find(filter).toArray();
      if (result) {
        const document = await userCollection.updateOne(filter, {
          $set: { role: "admin" },
        });
        console.log(document);
      }
    });

    //check admin
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await userCollection
        .find({ email: req.params.email })
        .toArray();
      console.log(result);
      res.send(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Drone server is running");
});

app.listen(port, () => {
  console.log("Server running at port", port);
});
