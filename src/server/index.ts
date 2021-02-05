import 'reflect-metadata';
const expressOasGenerator = require('express-oas-generator');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
import { Request, Response } from 'express';


const app = express();

expressOasGenerator.init(app, {});


//rest apis routers
const raceTrackerController = require("./race_handler/RaceController");


const port = process.env.PORT || 3500;

// setup the ability to see into response bodies
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use("/api", raceTrackerController);

// setup the express assets path
app.use('/', express.static(path.join(__dirname, '../client')))

// API calls ------------------------------------------------------------------------------------
app.get('/', async (req: Request, res: Response) => {
    const newPath = path.join(__dirname, '../client/pages/home.html');
    console.log(newPath);
    console.log("current directory is:", __dirname);
    res.sendFile(newPath);
});

app.get('/race', async (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/pages/race.html'));
});

app.get("/progress", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../client/pages/progress.html"));
});

app.get("/about", (req: Request, res: Response) => {
    return res.redirect("https://github.com/fervid-cloud/Car_Racing/blob/master/README.md");
});

app.listen(port, () => console.log(`Click Car Racing App is listening on port ${port}!`))
