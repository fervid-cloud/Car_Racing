import * as express from 'express';
import RaceService from './RaceService';
import { Request, Response } from 'express';
import Container from 'typedi';

const raceController = express.Router();

const raceService: RaceService = Container.get(RaceService);

/**
[GET] `api/tracks`

List of all tracks
- id: number (1)
- name: string ("Track 1")
- segments: number[]([87,47,29,31,78,25,80,76,60,14....])
 */
raceController.get("/tracks", (req: Request , res: Response) : void => {
    raceService.getRaceTracks((err : Error, tracks: any ) => {
        if (err) {
            res.end({ "error": "couldn't find the tracks" });
            return;
        }
        res.send(tracks);
    });
});



/**
-[GET] `api/cars`

 List of all cars
- id: number (3)
- driver_name: string ("Racer 1")
- top_speed: number (500)
- acceleration: number (10)
- handling: number (10)

 */
raceController.get("/cars", (req: Request, res: Response) : void => {

    raceService.getRaceCars((err: Error, cars: any) => {
        if (err) {
            res.end({ "error": "couldn't find the tracks" });
            return;
        }
        res.send(cars);
    });
});



/**
 * [POST] `api/races`
   Create a race

   - id: number
   - track: string
   - player_id: number
   - cars: Cars[] (array of cars in the race)
   - results: Cars[] (array of cars in the position they finished, available if the race is finished)
 */
raceController.post("/races", (req, res) => {
    console.log("request came for creating the race----------------------------------");
    console.log(req.body);
    const raceCreationResult = raceService.createRace(req.body);
    res.send(raceCreationResult);

});




/**
- [POST] `api/races/${id}/start`
  Begin a race
- Returns nothing
 */
raceController.post("/races/:id/start", (req, res) => {
    console.log("request came for starrting the race----------------------------------");
    raceService.startRaceById(parseInt(req.params.id), (err: Error, raceStartStatus: any) => {
        if (err) {
            res.send(err);
            return;
        }
        res.send(raceStartStatus);
    });
});



/**
  Information about a single race
- status: RaceStatus ("unstarted" | "in-progress" | "finished")
- positions object[] ([{ car: object, final_position: number (omitted if empty), speed: number, segment: number}])

 */
raceController.get("/races/:id", (req: Request, res: Response) => {
    console.log("request came for getting the status the race-------------------------------------------------------");
    const raceStatus = raceService.getRaceInfoById(parseInt(req.params.id));
    res.send(raceStatus);

});



/**
 * [POST] `api/races/${id}/accelerate`
   Accelerate a car
   - Returns nothing
 */
raceController.post("/races/:id/accelerate", (req, res) => {
    /**
        As the Http standard specifies:
        Each header field consists of a case-insensitive field name followed by a colon (":") ...
        so usually the entity which handles the request and response converts the header field into lowercase,
        so keep check of that
    */
    // let playerId: string | string[] | undefined = req.headers.racerId;

    let playerId: string | undefined = req.headers.playerid as string;
    console.log("playerId is : ", playerId);
    if (!playerId) {
        res.send({ error: "invalid playerId sent" });
        return;
    }
    raceService.accelerateCar(parseInt(req.params.id), parseInt(playerId), (err: Error, accelerateCarStatus: any) => {
        if (err) {
            // next(new Error("some error occured while accelerating the car"));
            res.send(err);
            return;
        }

        res.send(accelerateCarStatus);
    });
});

/* function isArrayOfStrings(value: any): boolean {
    return Array.isArray(value) && value.every(item => typeof item === "string");
}
 */

module.exports = raceController;