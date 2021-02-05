import { CurrentRaceStatus } from "dto/CurrentRaceStatus";
import { ProgressStatus } from "../enum/ProgressStatus";
import Car from "model/Car";
import Track from "model/Track";
import { Service } from "typedi";
import jsonData from '../model/data.json';
import RaceInfo from "model/RaceInfo";
import Position from "model/CarPositionInfo";
import RaceSimulation from "model/RaceSimulation";
import { Nullable, SetIntervalType } from "custom-type-definition";
import CarPositionInfo from "model/CarPositionInfo";

@Service()
export default class RaceManager {

    private cars: Car[];

    private tracks: Track[];

    private data: any;

    private MaxRaceId: number;

    private MinRaceId: number;

    private raceTracker : { [race_id: number ] : RaceSimulation } = {};

    private TIMER_INTERVAL: number;

    private frictionDeAcceleration: number;

    constructor() {
        this.data = jsonData;
        this.cars = this.data['cars'];
        console.log(this.cars);
        this.tracks = this.data['tracks'];
        this.MaxRaceId = (1 << 30);
        this.MinRaceId = 1;
        this.TIMER_INTERVAL = 1000;
        this.frictionDeAcceleration = -5; //km/s
    }

    getCars(): any {
        return this.cars;
    }

    getTracks(): any {
        return this.tracks;
    }



    /**
     *
     * @param playerId
     * @param trackId
     */
    createNewRace(playerId: number, trackId: number): any{
        let randomRaceId = Math.floor(Math.random() * (this.MaxRaceId - this.MinRaceId + 1)) + this.MinRaceId;

        const currentRaceStatus: CurrentRaceStatus = {
            status: ProgressStatus.UNSTARTED,
            positions: this.cars.map((car) => {
                return <CarPositionInfo> {
                    ...car,
                    speed: 0,
                    distanceTravelled: 0,
                };

            })
        }

        const newRaceInfo: RaceInfo = {
            raceId: randomRaceId,
            Track: this.tracks.filter((track) => track.id == trackId)[0],
            hostId: playerId,
            Cars: this.cars,
            Results: currentRaceStatus
        }

        let sumTillNow = 0;
        this.raceTracker[randomRaceId] = <RaceSimulation>{
            setIntervalPointer: undefined,
            raceInfo: newRaceInfo,
            completedRaceCount: 0
        };

        // carefully mind the  difference of '.' and bracket notation, '.' notation search for string equivalent of variable name whereas
        // bracket notation replace the variable with it's value unless the variable is a string itself
        this.raceTracker[randomRaceId].humanPlayers[playerId] = -1;
        return newRaceInfo;
        /**
            both typecasting and lefthandside type declaration is valid,it's just matter of preference, you can
            use <RaceSimulation> at the right hand side of assignmentor while returning the object which is typecasting the
            object to force it to behave like RaceSimulation(so now typescript will keep the checks of properties for us),
            and I used the type check for the variable that is keeping the reference of the object, so again typescript will
            make sure that variable can only contain reference of specified type and keep properties of assigned object in it's check
         */
    }


    startRaceById(race_id: number) : boolean{

        const currentRaceSimulation: RaceSimulation = this.raceTracker[race_id];
        if (!currentRaceSimulation || currentRaceSimulation.setIntervalPointer) {
            throw new Error("Invalid requested for race, either race has already been started or race doesn't exists");
        }

        currentRaceSimulation.raceInfo.Results.status = ProgressStatus.IN_PROGRESS;
        currentRaceSimulation.setIntervalPointer = setInterval(() => {
            let playerPositions: CarPositionInfo[] = currentRaceSimulation.raceInfo.Results.positions;
            this.shuffleArray(playerPositions);
            playerPositions = playerPositions.map((carPositionInfo: CarPositionInfo) => {
                let { speed, distanceTravelled, acceleration, topSpeed, id } = carPositionInfo;
                const currentTrackLength: number = currentRaceSimulation.raceInfo.Track.length;

                if (distanceTravelled < currentTrackLength) {
                    if (currentRaceSimulation.humanPlayers[id]) {
                        acceleration = 0;
                    }

                    const netAcceleration : number = acceleration - this.frictionDeAcceleration;
                    const oldSpeed: number = speed;
                    const newSpeed: number = Math.min(topSpeed, Math.max(0, oldSpeed + netAcceleration * this.TIMER_INTERVAL / 1000));
                    const distanceTravelledForInterval: number = Math.max(0, oldSpeed + ((1 / 2) * netAcceleration * this.TIMER_INTERVAL / 100));
                    let totalDistanceTravelled: number = distanceTravelled + distanceTravelledForInterval;

                    if (totalDistanceTravelled >= currentTrackLength) {
                        totalDistanceTravelled = currentTrackLength;
                        carPositionInfo.finalPosition = Date.now();
                        ++currentRaceSimulation.completedRaceCount;

                        if (currentRaceSimulation.completedRaceCount == currentRaceSimulation.raceInfo.Cars.length) {
                            clearInterval(<SetIntervalType>currentRaceSimulation.setIntervalPointer);
                            currentRaceSimulation.raceInfo.Results.status = ProgressStatus.FINISHED;
                        }
                    }

                    carPositionInfo.distanceTravelled = totalDistanceTravelled;
                    carPositionInfo.speed = newSpeed;
                }

                return carPositionInfo;
            });

        }, this.TIMER_INTERVAL);

        return true;
    }


    accelerateCar(raceId: string, callback: Function) {

    }



    getRaceInfoById(race_id: number): Nullable<CurrentRaceStatus> {
        const raceSimulation: RaceSimulation = this.raceTracker[race_id];
        if (!raceSimulation) {
            throw new Error(`No such race of ${race_id} exists`);
        }
        return raceSimulation.raceInfo.Results;
    }


    /**
     * shuffling through Fisher–Yates shuffle algorithm
     * @param playerPositions
     */
    shuffleArray(playerPositions: Position[]) {
        const n = playerPositions.length;
        for (let i = n - 1; i > 0; --i) {
            let rangeLength = i;
            const randomIndex = Math.floor(Math.random() * rangeLength) + 0;
            const temp = playerPositions[randomIndex];
            playerPositions[randomIndex] = playerPositions[i];
            playerPositions[i] = temp;
        }
    }


}