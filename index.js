const express = require('express');
const app = express();
const customers = require('request');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const sha1 = require('js-sha1');

let importedJSON = [];

const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DEV_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_USER_PASSWORD,
    database : process.env.DB_NAME,
});

connection.connect(function(err) {
    if (err) throw err;
    console.log('Connected!');
});

customers('https://63d396f0c1ba499e54c3f915.mockapi.io/api/v1/customers', function (error, response, body) {
    if (!error && response.statusCode === 200) {
        importedJSON = JSON.parse(body);
    }
})

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// enabling CORS for all requests
app.use(cors());

// authentication request : check if the user is authenticated
app.post('/auth', (req, res) => {
    const password = sha1(process.env.PASSWORD);
    connection.query("SELECT * FROM authentication", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
    if (password === process.env.HASH) {
        res.status(200).json({message: "Authentification successful", status: 200});
    }else {
        res.status(403).json({message: "Authentification failed", status: 403});
    }
});


app.get('/', (req, res) => {
    if (req.post('/auth')){
        res.status(201).json({message: "Using Webshop API", status: 201});
    }
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

//check create authentication key for user
app.post('/customers/auth/init', (req, res) => {
    const authKey = req.request.authKey;
    if (authKey === process.env.AUTH_KEY) {
        res.status(200).json({message: "Authentification successful", status: 200});
    }else {
        res.status(403).json({message: "Authentification failed", status: 403});
    }
    }
)

app.listen(process.env.DEV_PORT, () => {  console.log('Server listening on port 8090')});


