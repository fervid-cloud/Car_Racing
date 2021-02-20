import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { NextFunction, Request, Response } from 'express';

const port = process.env.PORT || 3500;
const app = express();


//redirecting to https
console.log(`This is a ${process.env.DEV ? 'Development' : 'Production'} Environment`);
if(!process.env.DEV) {
    app.use(httpRedirection);
}


// setup the ability to see into response bodies
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//rest apis routers
const raceTrackerController = require("./race_handler/RaceController");

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


function httpRedirection (req: Request, res: Response, next: NextFunction) {

    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
        next();
    }
}
