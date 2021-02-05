import * as express from 'express';
import RaceService from './RaceService';
import { Request, Response, NextFunction} from 'express';
import Container from 'typedi';
import { CurrentRaceStatus } from 'dto/CurrentRaceStatus';
import { Nullable } from '../custom-type-definition';

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

    const raceCreationResult = raceService.createRace(req.body);
    res.send(raceCreationResult);

});




/**
- [POST] `api/races/${id}/start`
  Begin a race
- Returns nothing
 */
raceController.post("/races/:id/start", (req, res) => {

    raceService.startRaceById(req.params.id, (err: Error, raceStartStatus: any) => {
        if (err) {
            res.send({ error: "some error occured while starting the race" });
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
    const raceStatus = raceService.getRaceInfoById(parseInt(req.params.id));
    res.send(raceStatus);

});



/**
 * [POST] `api/races/${id}/accelerate`
   Accelerate a car
   - Returns nothing
 */
raceController.post("/races/:id/accelerate", (req, res) => {

    raceService.accelerateCar(req.params.id, (err: Error, accelerateCarStatus: any) => {
        if (err) {
            // next(new Error("some error occured while accelerating the car"));
            res.send({ error: "testing" });
            return;
        }

        res.send(accelerateCarStatus);
    });
});



raceController.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.send({ error: err.message });
})

module.exports = raceController;