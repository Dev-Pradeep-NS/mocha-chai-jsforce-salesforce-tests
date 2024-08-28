const jsforce = require('jsforce');
const express = require('express');
const dotenv = require('dotenv');
const CryptoJS = require('crypto-js');
const bodyParser = require('body-parser');

var data = 'password'
var encrypted = CryptoJS.AES.encrypt(data, 'my-secret');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const oauth2 = new jsforce.OAuth2({
    loginUrl: process.env.SF_LOGIN_URL,
    clientId: process.env.SF_CONSUMER_KEY,
    clientSecret: process.env.SF_SECRET,
    redirectUri: process.env.APP_DOMAIN
});

const conn = new jsforce.Connection({ oauth2: oauth2 });

app.get('/', (req, res) => {
    new jsforce.Connection({ oauth2: oauth2 })
})

app.get('/authorize', (req, res) => {
    res.redirect(oauth2.getAuthorizationUrl({ scope: 'api id web' }));
});

app.get('/OauthRedirect', async (req, res) => {
    const code = req.query.code;
    try {
        await conn.authorize(code);
        res.send('success');
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).send('Authorization failed');
    }
});

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

app.post('/contact', async (req, res) => {
    try {
        const { FirstName, LastName, Email } = req.body;
        if (!FirstName || !LastName || !Email) {
            return res.status(400).send('Missing required fields');
        }
        const result = await conn.sobject('Contact').create({ FirstName, LastName, Email });
        res.status(201).json({ id: result.id });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).send('An error occurred');
    }
});

app.post('/contacts/createMultiple', async (req, res) => {
    try {
        const { records } = req.body;
        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).send('No records provided');
        }
        const results = await conn.sobject('Contact').create(records);

        const formattedResults = results.map(result => ({
            success: result.success,
            id: result.id
        }))
        res.status(200).json(formattedResults);
    } catch (error) {
        console.log("Error while creating multiple records")
        res.status(500).send("An error occured")
    }
})

app.put('/contact/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { FirstName, LastName, Email } = req.body;

        if (!id || !FirstName || !LastName || !Email) {
            return res.status(400).send('Missing required fields');
        }

        const result = await conn.sobject('Contact').update({ Id: id, FirstName, LastName, Email });
        res.status(200).send({ success: true, id: id });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).send('An error occurred');
    }
});

app.put('/contacts/updateMultiple', async (req, res) => {
    try {
        const { records } = req.body;

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).send('No records provided');
        }

        const results = await conn.sobject('Contact').update(records);

        const formattedResults = results.map(result => ({
            success: result.success,
            id: result.id
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error('Error updating contacts:', error);
        res.status(500).send('An error occurred');
    }
});

app.delete('/contact/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await conn.sobject('Contact').delete({ Id: id })
        res.status(200).send({ success: result.success })
    } catch (error) {
        res.status(500).send("An error occured")
    }
})

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = { app, server };
