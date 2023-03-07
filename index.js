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

// Login endpoint
app.post("/login/:email", (req, res) => {
    const { email } = req.params.email;
    if (!email) {
        res.status(404);
        res.send({
            message: "You didn't enter a valid email address.",
        });
    }
    const token = makeToken(email);
    const mailOptions = {
        from: "You Know",
        html: emailTemplate({
            email,
            link: `http://localhost:8090/account?token=${token}`,
        }),
        subject: "Your Magic Link",
        to: email,
    };
    return transport.sendMail(mailOptions, (error) => {
        if (error) {
            res.status(404);
            res.send("Can't send email.");
        } else {
            res.status(200);
            res.send(`Magic link sent. : http://localhost:8090/account?token=${token}`);
        }
    });
});

app.get("/account", (req, res) => {
    isAuthenticated(req, res)
});

const isAuthenticated = (req, res) => {  const { token } = req.query
    if (!token) {
        res.status(403)
        res.send("Can't verify user.")
        return
    }
    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    }
    catch {
        res.status(403)
        res.send("Invalid auth credentials.")
        return
    }
    if (!decoded.hasOwnProperty("email") || !decoded.hasOwnProperty("expirationDate")) {
        res.status(403)
        res.send("Invalid auth credentials.")
        return
    }
    const { expirationDate } = decoded
    if (expirationDate < new Date()) {
        res.status(403)
        res.send("Token has expired.")
        return
    }
    res.status(200)
    res.send("User has been validated.")
}


const transport = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Make email template for magic link
const emailTemplate = ({ username, link }) => `
  <h2>Bonjour ${username}</h2>
  <p>Scanner ce QRCode pour vous connectez:</p>
  <p>${link}</p>`;

// Generate token
const makeToken = (email) => {
    const expirationDate = new Date();
    expirationDate.setHours(new Date().getHours() + 1);
    return jwt.sign({ email, expirationDate }, process.env.JWT_SECRET_KEY);
};


//create  qr code every time this endpoint is called
app.get('/qr', (req,res) => {
    QRCode.toDataURL("https://63d396f0c1ba499e54c3f915.mockapi.io/api/v1/customers", function (err, qrCode) {
        console.log(qrCode)
        let transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: 'emzil@adress.com',
                pass: 'password'
            }
        });

        let mailOptions = {
            from: 'henri.spaulding@epsi.fr',
            to: 'henri.spaulding@epsi.fr',
            subject: 'Sending Email using Node.js',
            html: '<img src="'+ qrCode + '" alt="missing qr code">'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    })
    res.send("qr code sent")
});

app.delete('/token', (req,res) => {    res.send("destroy token")});

app.listen(process.env.DEV_PORT, () => {  console.log('Server listening on port 8090')});


