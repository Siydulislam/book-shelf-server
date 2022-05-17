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

async function run() {
    try {
        await client.connect();
        const bookCollection = client.db('bookDepo').collection('book');

        // get all book
        // http://localhost:5000/book/
        app.get('/book', async (req, res) => {
            const query = req.body;
            const cursor = bookCollection.find(query);
            const books = await cursor.toArray();
            res.send(books);
        });

        // get a specific book
        // http://localhost:5000/book/6276c29ca41442594cfebbca
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const book = await bookCollection.findOne(query);
            res.send(book);
        });

        // post a new book
        // http://localhost:5000/book
        app.post('/book', async (req, res) => {
            const newBook = req.body;
            const result = await bookCollection.insertOne(newBook);
            res.send(result);
        });

        // update a specific book quantity and delivered quantity
        // 
        app.put('/book/:id', async (req, res) => {
            const id = req.params.id;
            const updatedInfo = req.body;
            console.log(updatedInfo)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    quantity: updatedInfo.quantity,
                    sold: updatedInfo.sold
                }
            }
            const result = await bookCollection.updateOne(
                filter,
                updateDoc,
                options
            )

            res.send(result);
        })

        // delete a specific book
        // 
        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const deletedBook = await bookCollection.deleteOne(filter);
            console.log(deletedBook);
            // res.send(deletedBook);
        })

        console.log("DB connected");
    } finally {

    }
}

run().catch(console.dir);


app.listen(port, () => {
    console.log("server is running");
})