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
        const userCollection = database.collection("users");

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
        //Recieve product from dashboard(admin-> Add product)
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product)
            console.log(result);
            res.json(result)
        })
        //Delete product from database (request come from Dashboard->Manage all product)
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.json(result)
        })
        //Recieve orders from Client side(purchase)
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.json(result);
        })
        //send orders data from Database
        app.get('/orders', async (req, res) => {
            const orders = orderCollection.find({})
            const result = await orders.toArray()
            res.json(result)
        })
        //Status update from client side
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const order = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const makeShiped = {
                $set: {
                    status: 'Shiped'
                },
            };
            const result = await orderCollection.updateOne(filter, makeShiped, options);
            res.json(result)
        })
        //Delete order item from the dashboard(customer)
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.send(result);
        })

        //Recive users from Client site when user will be registered
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user)
            res.json(result)
        })
        //Send user database to client side
        app.get('/users', async (req, res) => {
            const users = userCollection.find({})
            const result = await users.toArray()
            res.json(result)
        })
        //Users role Update
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        //Find admin from user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
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