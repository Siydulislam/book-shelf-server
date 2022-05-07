const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Welcome to my server");
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vt6on.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

const run = async () => {
    try {
        await client.connect();
        const bookCollection = client.db('bookDepo').collection('book');

        // get all book
        app.get('/book', async (req, res) => {
            const query = req.body;
            const cursor = bookCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // get a specific book
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const book = await bookCollection.findOne(query);
            res.send(book);
        });

        console.log("DB connected");
    } finally {

    }
}

run().catch(console.dir);


app.listen(port, () => {
    console.log("server is running");
})