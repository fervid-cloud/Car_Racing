import { Nullable } from "custom-type-definition";
import { CurrentRaceStatus } from "dto/CurrentRaceStatus";
import { ProgressStatus } from "../enum/ProgressStatus";
import Car from "model/Car";
import Track from "model/Track";
import { Service } from "typedi";
import jsonData from '../model/data.json';
import RaceInfo from "model/RaceInfo";
import Position from "model/Position";
import RaceSimulation from "model/RaceSimulation";

@Service()
export default class RaceManager {

    private cars: Car[];

    private tracks: Track[];

    private data: any;

    private MaxRaceId: number;

    private MinRaceId: number;

    private raceTracker : any = {};

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

    createNewRace(player_id: number, track_id: number): any{
        let randomRaceId = Math.floor(Math.random() * (this.MaxRaceId - this.MinRaceId + 1) + this.MinRaceId);

        const currentRaceStatus: CurrentRaceStatus = {
            status: ProgressStatus.UNSTARTED,
            positions: this.cars.map((car) => {
                return <Position> {
                    ...car,
                    speed: 0,
                    segment: 0,
                };

            })
        }

        const newRaceInfo: RaceInfo = {
            ID: randomRaceId,
            Track: this.tracks.filter((track) => track.id == track_id)[0],
            PlayerID: player_id,
            Cars: this.cars,
            Results: currentRaceStatus
        }

        this.raceTracker[randomRaceId] = <RaceSimulation>{
            setIntervalPointer: undefined,
            raceInfo: newRaceInfo
        };

        // carefully mind the difference of . and bracket notation . notation search for string equivalent of variable whereas
        // bracket notation replace the variable with it's value unless the variable is a string itself
         this.raceTracker[randomRaceId].humanPlayers[player_id] = true;
        return newRaceInfo;
        /**
            both typecasting and lefthandside type declaration is valid, it just a matter of preference
            it's just matter of preference, you can use <RaceSimulation> at the right hand side of assignment
            or while returning the object which is typecasting the object to force it to behave like RaceSimulation
            (so now typescript will keep the checks of properties for us), and I used the type check for the variable
            that is keeping the reference of the object, so again typescript will make sure that variable can only
            contain reference of specified type and keep properties of assigned object in it's check
         */
    }


    startRaceById(raceId: string, callback: Function) {

        const currentRaceSimulation: RaceSimulation= this.raceTracker[raceId];
        if (!currentRaceSimulation || currentRaceSimulation.setIntervalPointer) {
            throw new Error("Invalid requested for race, either race has already been started or race doesn't exists");
        }


        currentRaceSimulation.raceInfo.Results.status = ProgressStatus.IN_PROGRESS;
        currentRaceSimulation.setIntervalPointer = setInterval(() => {
            // currentRaceSimulation.

        }, 1000);

        return null;
    }



    accelerateCar(raceId: string, callback: Function) {

    }

    getRaceInfoById(raceId: string): Nullable<CurrentRaceStatus> {
        const raceSimulation: RaceSimulation = this.raceTracker[raceId];
        if (!raceSimulation) {
            throw new Error(`No such race of ${raceId} exists`);
        }

        return raceSimulation.raceInfo.Results;
    }

}