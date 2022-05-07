const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.send("Welcome to my server");
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vt6on.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

const run = async () => {
    try {
        await client.connect();
        console.log("DB connected");
    } catch (error) {
        console.log(error)
    }
}

run();


app.listen(port, () => {
    console.log("server is running");
})