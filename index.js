const express = require('express');
const app = express();
const customers = require('request');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const QRCode = require('qrcode');
const {toCanvas} = require("qrcode");

let importedJSON = [];

customers('https://63d396f0c1ba499e54c3f915.mockapi.io/api/v1/customers', function (error, response, body) {
    if (!error && response.statusCode === 200) {
        importedJSON = JSON.parse(body);
        console.log("Customer list received");
    }
})

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
    res.status(200).json(importedJSON);
});

//get request for a specific customer with username to show the customer's details
app.get('/customers/:id', (req, res) => {
    const id = req.params.id;
    const customer = importedJSON.find(customer => customer.id === id);
    res.status(200).json(customer);
});

app.get('/prospects', (req,res) => {    res.send("Prospects list")});
app.get('/orders', (req,res) => {    res.send("Orders list")});
//product list (all products)
app.get('/products', (req,res) => {    res.send("Products list")});
//stock list (all stocks)
app.get('/stocks', (req,res) => {    res.send("Stocks list")});
app.post('/auth', (req,res) => {    res.send("authenticate")});

//create  qr code every time this endpoint is called
app.get('/qr', (req,res) => {
    QRCode.toDataURL('I am a pony!', function (err, url) {
        console.log(url)
    })
    res.send("qr code")

});

app.delete('/token', (req,res) => {    res.send("destroy token")});

app.listen(8090, () => {  console.log('Server listening on port 8090')});


