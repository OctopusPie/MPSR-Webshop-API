const express = require('express');
const app = express();
const customers = require('request');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const nodeMailer = require("nodemailer");
const jwt = require("nodemailer/lib/dkim");
require('dotenv').config();

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
app.use(bodyParser.urlencoded({ extended: false }));

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

//check if webshop authentification key is correct
app.post('/customers/auth', (req, res) => {
    const authKey = req.body.authKey;
    if (authKey === process.env.AUTH_KEY) {
        res.status(200).json({message: "Authentification successful", status: 200});
    }else {
        res.status(403).json({message: "Authentification failed", status: 403});
    }
    }
)

app.listen(process.env.DEV_PORT, () => {  console.log('Server listening on port 8090')});


