const jsforce = require('jsforce');
const express = require('express');
const dotenv = require('dotenv');
const CryptoJS = require('crypto-js');

var data = 'password'
var encrypted = CryptoJS.AES.encrypt(data, 'my-secret');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const conn = new jsforce.Connection({
    loginUrl: process.env.SF_LOGIN_URL
});

app.get('/login', async (req, res) => {
    try {
        const userInfo = await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD + process.env.SF_TOKEN);
        res.json(userInfo);
    } catch (error) {
        console.log(error)
    }
})

app.get("/accounts", async (req, res) => {
    try {
        const accounts = await conn.query("SELECT Id, Name, Industry FROM Account LIMIT 2");
        res.json(accounts.records);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send("An error occurred");
    }
});

app.get("/accounts/ids", async (req, res) => {
    try {
        const ids = req.query.ids;

        if (!ids) {
            return res.status(400).send("No IDs provided");
        }

        const idArray = ids.split(',').map(id => `'${id}'`).join(',');
        const query = `SELECT Id, Name, Industry FROM Account WHERE Id IN (${idArray})`;

        const accounts = await conn.query(query);
        res.json(accounts.records);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send("An error occurred");
    }
});


const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = { app, server };
