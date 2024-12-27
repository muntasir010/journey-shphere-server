const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0yxll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const touristCollection = client.db('touristDB').collection('tourist');
        const userCollection = client.db('touristDB').collection('user');

        app.get('/tourist', async (req, res) => {
            const cursor = touristCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/tourist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await touristCollection.findOne(query);
            res.send(result);
        })

        app.post('/tourist', async (req, res) => {
            const newTourist = req.body;
            console.log(newTourist)
            const result = await touristCollection.insertOne(newTourist);
            res.send(result);
        })

        app.put('/tourist/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedTourist = req.body;

            const tourist = {
                $set: {
                    name: updatedTourist.name,
                    country: updatedTourist.country,
                    location: updatedTourist.location,
                    description: updatedTourist.description,
                    cost: updatedTourist.cost,
                    seasonality: updatedTourist.seasonality,
                    time: updatedTourist.time,
                    totalVisitorsPerYear: updatedTourist.totalVisitorsPerYear,
                    email: updatedTourist.email,
                    userName: updatedTourist.userName,
                    photo: updatedTourist.photo,
                }
            }
            const result = await touristCollection.updateOne(filter, tourist, options);
            res.send(result);
        })

        app.delete('/tourist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await touristCollection.deleteOne(query);
            res.send(result);
        })


        // user management apis
        app.get('/user', async( req, res) =>{
            const cursor = userCollection.find();
            const users = await cursor.toArray();
            res.send(users);
        })

        app.post('/user', async( req, res) =>{
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.patch('/user', async(req, res) =>{
            const user = req.body;
            const filter = {email : user.email};
            const updateDoc = {
                $set: {
                    lastLoggedAt: user.lastLoggedAt
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/user/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Journey Sphere tourist making server running")
});

app.listen(port, () => {
    console.log(`Journey Server is running on ${port}`)
})