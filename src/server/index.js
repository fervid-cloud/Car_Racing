const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = process.env.PORT || 80;

// setup the ability to see into response bodies
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// setup the express assets path
app.use('/', express.static(path.join(__dirname, '../client')))

// API calls ------------------------------------------------------------------------------------
app.get('/', async (req, res) => {
    const newPath = path.join(__dirname, '../client/pages/home.html');
    console.log(newPath);
    console.log("current directory is:", __dirname);
    res.sendFile(newPath);
});

app.get('/race', async (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages/race.html'));
});

app.get("/progress", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/pages/progress.html"));
});

app.get("/about", (req, res) => {
    return res.redirect("https://github.com/fervid-cloud/Car_Racing/blob/master/README.md");
});

app.listen(port, () => console.log(`Click Car Racing App is listening on port ${port}!`))
