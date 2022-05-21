const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const { decode } = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Welcome to my server");
});

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access!' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vt6on.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

async function run() {
    try {
        await client.connect();
        const bookCollection = client.db('bookDepo').collection('book');

        // Auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            })
            res.send({ accessToken });
        });

        // get all book
        app.get('/book', async (req, res) => {
            const query = req.body;
            const cursor = bookCollection.find(query);
            const books = await cursor.toArray();
            res.send(books);
        });

        // get a specific book
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const book = await bookCollection.findOne(query);
            res.send(book);
        });

        // get book of individual
        app.get('/myBooks', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = bookCollection.find(query);
                const myBooks = await cursor.toArray();
                res.send(myBooks);
            }
            else {
                res.status(403).send({ message: 'Access Forbidden!' });
            }
        })

        // post a new book
        app.post('/book', async (req, res) => {
            const newBook = req.body;
            const result = await bookCollection.insertOne(newBook);
            res.send(result);
        });

        // update a specific book quantity and delivered quantity
        app.put('/book/:id', async (req, res) => {
            const id = req.params.id;
            const updatedInfo = req.body;
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
        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const deletedBook = await bookCollection.deleteOne(filter);
            res.send(deletedBook);
        })

        console.log("DB connected");
    } finally {

    }
}

run().catch(console.dir);


app.listen(port, () => {
    console.log("server is running");
})