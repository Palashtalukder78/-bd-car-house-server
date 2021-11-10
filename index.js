const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require('cors')

const app = express()
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ack9d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("bdCarHouse");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        //Find all Products from Database and render in client side( home/all-products)
        app.get('/products', async (req, res) => {
            const products = productCollection.find({})
            const result = await products.toArray();
            res.json(result);
        })
        //FindSingle product from database
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result)
        })
        //Send orders from Client side(purchase)
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.json(result);
        })

        console.log("Database connection");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Bd car house server running................')
})

app.listen(port, () => {
    console.log("Running Port", port)
})