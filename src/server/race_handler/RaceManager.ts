import { Nullable } from "custom-type-definition";
import { CurrentRaceStatus } from "dto/CurrentRaceStatus";
import { ProgressStatus } from "../enum/ProgressStatus";
import Car from "model/Car";
import Track from "model/Track";
import { Service } from "typedi";
import jsonData from '../model/data.json';

@Service()
export default class RaceManager {

    private cars: Car[];

    private tracks: Track[];

    private data: any;

    private MaxRaceId: number;

    private MinRaceId: number;

    private RaceTracker : any = {};

    constructor() {
        this.data = jsonData;
        this.cars = this.data['cars'];
        console.log(this.cars);
        this.tracks = this.data['tracks'];
        this.MaxRaceId = (1 << 30);
        this.MinRaceId = 1;
    }

    getCars(): any {
        return this.cars;
    }

    getTracks(): any {
        return this.tracks;
    }

    createNewRace(player_id: string, track_id: string): any{
        let randomRaceId = Math.floor(Math.random() * (this.MaxRaceId - this.MinRaceId + 1) + this.MinRaceId);
        const tempObject = { randomRaceId };
        this.RaceTracker[randomRaceId] = {
            status: ProgressStatus.UNSTARTED,

        };

        // const CreateRaceResponse = {
        //
        // }
        return null;
    }


    startRaceById(raceId: string, callback: Function) {

    }


    accelerateCar(raceId: string, callback: Function) {

    }

    getRaceInfoById(raceId: string): Nullable<CurrentRaceStatus> {
        return null;
    }

}