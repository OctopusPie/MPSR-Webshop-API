const express = require('express');
const app = express();
const customers = require('request');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
let importedJSON = [];

const mysql = require('mysql2');
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
    const email = req.body.email;
    connection.query("SELECT * FROM authentication WHERE email = ?;", email, function (err, result) {
        if (err) throw err;
        if (req.body.hash === result[0].hash) {
            res.status(200).json({message: "Authentication successful", status: 200});
        }else {
            res.status(403).json({message: "Authentication failed", status: 403});
        }
    });
});


app.get('/', (req, res) => {
    if (req.post('/auth')){
        res.status(201).json({message: "Using Webshop API", status: 201});
    }
});

app.get('/customers', (req,res) => {
    if (req.post('/auth')){
        res.status(200).json(importedJSON);
    }

});

//get request for a specific customer with username to show the customer's details
app.get('/customers/:id', (req, res) => {
    if (req.post('/auth')){
        const id = req.params.id;
        const customer = importedJSON.find(customer => customer.id === id);
        res.status(200).json(customer);
    }

});

app.listen(process.env.DEV_PORT, () => {  console.log('Server listening on port 8090')});


