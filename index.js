require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n5f1cjf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    // await client.connect();
    const db = client.db("books-catalog");
    const booksCollection = db.collection("books");
    console.log("successfully connected to MongoDB!");

    app.get("/books", async (req, res) => {
      const cursor = booksCollection.find({});
      const book = await cursor.toArray();
      res.send({ status: true, data: book });
    });
    app.get("/books/:id", async (req, res) => {
      id = req.params.id;
      console.log(id);
      const result = await booksCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });
    app.post("/add-new-book", async (req, res) => {
      const book = req.body;
      console.log(book);
      const result = await booksCollection.insertOne(book);
      res.send(result);
    });

    app.post("/review/:id", async (req, res) => {
      const id = req.params.id;
      const review = req.body.review;
      console.log(id);
      console.log(review);
      const result = await booksCollection.updateOne(
        { _id: ObjectId(id) },
        { $push: { reviews: review } }
      );
      console.log(result);
      if (result.modifiedCount !== 1) {
        console.error("Book not found or review not added");
        res.json({ error: "Book not found or review not added" });
        return;
      }

      console.log("Review added successfully");
      res.json({ message: "Review added successfully" });
    });

    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const result = await booksCollection.findOne(
        { _id: ObjectId(id) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: " not found" });
      }
    });
  } finally {
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
