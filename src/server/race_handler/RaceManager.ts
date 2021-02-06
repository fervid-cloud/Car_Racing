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

    private raceTracker : { [raceId: number ] : RaceSimulation } = {};

    private TIMER_INTERVAL: number;

    private frictionDeAcceleration: number;

    constructor() {
        this.data = jsonData;
        this.cars = this.data['cars'];
        console.log(this.cars);
        console.log(this.data['tracks']);
        this.tracks = this.assignTracks(this.data['tracks']);
        this.MaxRaceId = (1 << 30);
        this.MinRaceId = 1;
        this.TIMER_INTERVAL = 1000;
        this.frictionDeAcceleration = 2; //m/s
    }


    assignTracks(givenTracks: { segments: number[]; name: string; id: number; }[]): Track[] {
        console.log("_______________________");
        console.log(givenTracks);
        return givenTracks.map((element: { segments: number[]; name: string; id: number; }) => {
            console.log("segments is :", element.segments);
            const singleTrack: Track = {
                name: element.name,
                id: element.id,
                length: element.segments.reduce((previousValue: number = 0, segmentValue: number) => {
                    return previousValue + segmentValue;
                })
            }
            return singleTrack;
        });
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
        console.log("random raceId generated is : ", randomRaceId);
        const currentRaceStatus: CurrentRaceStatus = {
            status: ProgressStatus.UNSTARTED,
            positions: this.cars.map((car) => {
                return <CarPositionInfo> {
                    ...car,
                    speed: 0,
                    distanceTravelled: 0
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
;
        const newRaceSimulation: RaceSimulation = {
            setIntervalPointer: undefined,
            raceInfo: newRaceInfo,
            completedRaceCount: 0,
            humanPlayers: {

            }
        };


        // carefully mind the  difference of '.' and bracket notation, '.' notation search for string equivalent of variable name whereas
        // bracket notation replace the variable with it's value unless the variable is a string itself
        newRaceSimulation.humanPlayers[playerId] = -1;
        console.log("playerId is : ", playerId);
        console.log("new raceSimulation generated is : ", newRaceSimulation);

        this.raceTracker[randomRaceId] = newRaceSimulation
        return newRaceInfo;
        /**
            both typecasting and lefthandside type declaration are not same ,it's not just matter of preference, you can
            use <RaceSimulation> as a hack at the right hand side of assignment operator(if you do not have some property in the object at the right hand side that is
            defined by typescript through interface or class) while returning the object which is typecasting the
            object to force it to behave like RaceSimulation(so now typescript will only keep the checks of properties for us which were typecasted, not those which exist in
            the definition of object but doesn't exit in the typecasted object, but it doesn't mean that it will not give error if there is some property
            which doesn't exit in interface/class but exist in object being typecasted), and I used the type check for the variable that is keeping the reference of the object, so again typescript will
            make sure that variable can only contain reference of specified type and keep properties of assigned object in it's check
         */
    }


    startRaceById(raceId: number) : boolean{

        const currentRaceSimulation: RaceSimulation = this.raceTracker[raceId];
        if (!currentRaceSimulation || currentRaceSimulation.setIntervalPointer) {
            throw new Error("Invalid requested for race, either race has already been started or race doesn't exists");
        }
        let counter = 0;
        this.printStatus(counter, currentRaceSimulation);
        console.log("before starting the race : ", currentRaceSimulation.raceInfo.Results.positions);
        currentRaceSimulation.raceInfo.Results.status = ProgressStatus.IN_PROGRESS;
        currentRaceSimulation.setIntervalPointer = setInterval(() => {
            let playerPositions: CarPositionInfo[] = currentRaceSimulation.raceInfo.Results.positions;
            this.shuffleArray(playerPositions);
            playerPositions = playerPositions.map(this.updateRaceProgressStatus(currentRaceSimulation));
            ++counter;
            this.printStatus(counter, currentRaceSimulation, playerPositions);
            // console.log(playerPositions);
        }, this.TIMER_INTERVAL);

        return true;
    }


    updateRaceProgressStatus(currentRaceSimulation: RaceSimulation, speedIncrease?: boolean) {

        return (carPositionInfo: CarPositionInfo) => {
            let { speed, distanceTravelled, acceleration, topSpeed, id } = carPositionInfo;
            const currentTrackLength: number = currentRaceSimulation.raceInfo.Track.length;
            console.log("current player is : ", carPositionInfo);
            if (distanceTravelled < currentTrackLength) {
                console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", currentRaceSimulation.humanPlayers[id]);
                if (currentRaceSimulation.humanPlayers[id] && !speedIncrease) {
                    acceleration = 0;
                }

                const netAcceleration: number = acceleration - this.frictionDeAcceleration;
                const oldSpeed: number = speed;

                let distanceTravelledForInterval;
                if (oldSpeed == topSpeed) {
                    distanceTravelledForInterval = (netAcceleration <= 0) ? 0 : oldSpeed * this.millSecondtoSeconds(this.TIMER_INTERVAL);
                }
                else {
                    distanceTravelledForInterval = Math.max(0, oldSpeed + ((1 / 2) * netAcceleration * this.millSecondtoSeconds(this.TIMER_INTERVAL)));
                }

                console.log("netAcceleration is : ", netAcceleration);
                console.log("time in seconds is : ", this.millSecondtoSeconds(this.TIMER_INTERVAL));
                console.log("top speed is : ", topSpeed);
                let newSpeed = Math.min(topSpeed, Math.max(0, oldSpeed + (netAcceleration * this.millSecondtoSeconds(this.TIMER_INTERVAL))));

                let totalDistanceTravelled: number = distanceTravelled + distanceTravelledForInterval;

                if (totalDistanceTravelled >= currentTrackLength) {
                    newSpeed = 0;
                    totalDistanceTravelled = currentTrackLength;
                    // carPositionInfo.finalPosition = Date.now();
                    if (!carPositionInfo.finalPosition) {
                        carPositionInfo.finalPosition = ++currentRaceSimulation.completedRaceCount;
                    }

                    if (currentRaceSimulation.completedRaceCount == currentRaceSimulation.raceInfo.Cars.length) {
                        clearInterval(<SetIntervalType>currentRaceSimulation.setIntervalPointer);
                        currentRaceSimulation.raceInfo.Results.status = ProgressStatus.FINISHED;
                    }
                }

                carPositionInfo.distanceTravelled = totalDistanceTravelled;
                carPositionInfo.speed = newSpeed;
                console.log("old speed is : ", oldSpeed);
                console.log("new speed is : ", newSpeed);
            }

            return carPositionInfo;
        }
    }


    printStatus(counter: number, ...all : any) {
        console.log("-------------------------------------------------------------------------------------");
        console.log("at stage : ", counter, " value is :");
        for (let i = 0; i < all.length; ++i) {
            console.log(all[i]);
        }
        console.log("-------------------------------------------------------------------------------------");
    }



    accelerateCar(raceId: number, playerId: number) {
        const currentRaceSimulation: RaceSimulation = this.raceTracker[raceId];

        if (!currentRaceSimulation) {
            throw new Error("Invalid requested for race, either race has expired or race doesn't exists");
        }

        const playerCarPositionInfo = currentRaceSimulation.raceInfo.Results.positions.filter(carPositionInfo => carPositionInfo.id == playerId);
        if (playerCarPositionInfo.length == 0) {
            throw new Error("Invalid playerId");
        }

        if(currentRaceSimulation.raceInfo.Results.status !== ProgressStatus.IN_PROGRESS) {
            throw new Error("Race is not in progress, acceleration is not possible");
        }

        const callback: Function = this.updateRaceProgressStatus(currentRaceSimulation, true);
        callback(playerCarPositionInfo[0]);
        return true;
    }



    getRaceInfoById(raceId: number): Nullable<CurrentRaceStatus> {
        console.log("returning the race info---------------------");
        const raceSimulation: RaceSimulation = this.raceTracker[raceId];
        if (!raceSimulation) {
            throw new Error(`No such race of ${raceId} exists`);
        }
        return raceSimulation.raceInfo.Results;
    }


    /**
     * Shuffling through Fisher–Yates algorithm
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


    millSecondtoSeconds(milliSecondTime: number) {
        return milliSecondTime / 1000;
    }

}