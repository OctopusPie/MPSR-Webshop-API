const express = require('express');
const app = express();
const customers = require('./customermock.json')
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

app.get('/', (req, res) => {
    res.status(201).json({message: "Successfully Registered", status: 201});
});

app.get('/customers', (req,res) => {
    res.status(200).json(customers)
});

//get request for a specific customer with username to show the customer's details
app.get('/customers/:username', (req, res) => {
    const username = req.params.username;
    const customer = customers.find(customer => customer.username === username);
    res.status(200).json(customer);
});

app.get('/prospects', (req,res) => {    res.send("Prospects list")});
app.get('/orders', (req,res) => {    res.send("Orders list")});
app.get('/products', (req,res) => {    res.send("Products list")});
app.get('/stocks', (req,res) => {    res.send("Stocks list")});
app.post('/auth', (req,res) => {    res.send("authenticate")});
app.post('/token', (req,res) => {    res.send("Create and send QR code key")});
app.delete('/token', (req,res) => {    res.send("destroy token")});

app.listen(8090, () => {  console.log('Server listening on port 8090')});


