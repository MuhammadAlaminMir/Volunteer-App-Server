const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
// const PORT = process.env.PORT || 8080;
const app = express();
app.use(bodyParser.json());
app.use(cors());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tyenc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
client.connect((err) => {
    const volunteerCollection = client
        .db('volunteer-network')
        .collection('volunteer');
    console.log('i am connected');

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    app.get('/allVolunteers', (req, res) => {
        volunteerCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });
    app.post('/addVolunteer', (req, res) => {
        const volunteer = req.body;
        console.log(volunteer);
        volunteerCollection
            .insertOne(volunteer)
            .then((result) => {
                res.send(result.insertedCount > 0);
            })
            .catch((err) => console.log(err));
    });
    app.post('/eventByEmail', (req, res) => {
        const userInput = req.body;
        if (userInput.email !== undefined) {
            volunteerCollection
                .find({ email: { $regex: userInput.email } })
                .toArray((err, documents) => {
                    res.send(documents);
                });
        }
    });
    app.post('/removeEvent', (req, res) => {
        const eventId = req.body._id;

        const email = req.body.email;
        console.log(eventId, email);
        volunteerCollection.deleteOne({ _id: ObjectId(eventId) });
        volunteerCollection
            .find({ email: { $regex: email } })
            .toArray((err, documents) => {
                res.send(documents);
            });
    });
});

app.listen(process.env.PORT || 8080);
