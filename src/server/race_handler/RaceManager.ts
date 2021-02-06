import { CurrentRaceStatus } from "dto/CurrentRaceStatus";
import { ProgressStatus } from "../enum/ProgressStatus";
import Car from "model/Car";
import Track from "model/Track";
import { Service } from "typedi";
import jsonData from '../model/data.json';
import RaceInfo from "model/RaceInfo";
import Position from "model/CarPositionInfo";
import { RaceSimulation } from "model/RaceSimulation";
import { Nullable, SetIntervalType } from "custom-type-definition";
import CarPositionInfo from "model/CarPositionInfo";
import { HumanPlayerActivityInfo } from "model/RaceSimulation";
import * as util from 'util';

@Service()
export default class RaceManager {

    private cars: Car[];

    private tracks: Track[];

    private data: any;

    private MaxRaceId: number;

    private MinRaceId: number;

    private raceTracker : { [raceId: string ] : RaceSimulation } ;

    private TIMER_INTERVAL: number;

    private GARBAGE_COLLECTION_TIME_INTERVAL = 1/2 * 60 * 1000; // 10 minutes in milliseconds

    constructor() {
        this.data = jsonData;
        console.log("The Cars are -------------------");
        this.cars = this.data['cars'];
        console.log(this.cars);
        console.log(this.data['tracks']);
        this.tracks = this.assignTracks(this.data['tracks']);
        this.MaxRaceId = (1 << 30);
        this.MinRaceId = 1;
        this.TIMER_INTERVAL = 1000;
        this.raceTracker = {};
        this.initializeGarbageCollector();
    }


    private initializeGarbageCollector(): void {
        /**Note that, the arrow function “inherits” the context from the function where it is defined.
        A regular function in this example would create its own context (window or undefined in strict mode).
        So to make the same code work correctly with a function expression it’s necessary to manually bind the
        context: setTimeout(function() {...}.bind(this)). This is verbose, and using an arrow function is a
        cleaner and shorter solution. An arrow function is bound with the lexical this once and forever. this
        cannot be modified even when using the context modification methods(i.e using, call, bind or apply will not work):  */
        setInterval(this.evictGarbage.bind(this), this.GARBAGE_COLLECTION_TIME_INTERVAL);
    }


    evictGarbage(): void {
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
        console.log("---------------------------------------GARBAGE COLLECTION EVENT---------------------------------");
        console.log("current status of the raceTracker is : ", this.raceTracker);
        console.log(util.inspect(this.raceTracker, { depth: null }));
        const existingRaceIds: string[] = Object.keys(this.raceTracker);
        const currentTime = new Date();
        console.log("-----------current Time is : ", currentTime);
        existingRaceIds.forEach((currentRaceId) => {
            const currentRaceInfo: RaceSimulation = this.raceTracker[currentRaceId];
            if (!currentRaceId) {
                return;
            }
            let latestTime = 0;
            const humanPlayerTracker: { [playerId: string]: HumanPlayerActivityInfo } = currentRaceInfo.humanPlayers;
            if (!humanPlayerTracker) {
                return;
            }
            Object.keys(humanPlayerTracker).forEach(playerId => {
                latestTime = Math.max(latestTime, humanPlayerTracker[playerId].lastActivity.getTime());
            });
            //getTime method returns time in millisecond passed since 1970 which is same as returned by Date.now()

            if (currentTime.getTime() - latestTime > this.GARBAGE_COLLECTION_TIME_INTERVAL) {
                console.log("before garbage collection, raceTracker status is :");
                console.log(util.inspect(this.raceTracker, { depth: null }));
                clearInterval(<SetIntervalType>currentRaceInfo.setIntervalPointer);
                delete this.raceTracker[currentRaceId];
                console.log("interval is removed");
                console.log("race with RaceId: ", currentRaceId, "has been garbage collected");
                console.log("after garbage collection, update raceTracker status is :");
                console.log(util.inspect(this.raceTracker, { depth: null }));
                console.log("-----------current Time is : ", currentTime);
            }
        });
        console.log("---------------------------------------END OF GARBAGE COLLECTION EVENT---------------------------------");
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    }


    assignTracks(givenTracks: { segments: number[]; name: string; id: number; }[]): Track[] {
        console.log("The Tracks are -------------------");
        console.log(givenTracks);
        return givenTracks.map((element: { segments: number[]; name: string; id: number; }) => {
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
        };

        const newRaceSimulation: RaceSimulation = {
            setIntervalPointer: undefined,
            raceInfo: newRaceInfo,
            completedRaceCount: 0,
            humanPlayers: {

            }
        };

        // carefully mind the  difference of '.' and bracket notation, '.' notation search for string equivalent of variable name whereas
        // bracket notation replace the variable with it's value unless the variable is a string itself
        const hostPlayerActivity : HumanPlayerActivityInfo= {
            lastActivity: new Date(),
            accelerationAttempts: []
        }

        newRaceSimulation.humanPlayers[playerId] = hostPlayerActivity;
        this.raceTracker[randomRaceId] = newRaceSimulation;
        console.log("new raceTracker is : ", util.inspect(this.raceTracker, { depth: null }));
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
        currentRaceSimulation.raceInfo.Results.status = ProgressStatus.IN_PROGRESS;
        currentRaceSimulation.setIntervalPointer = setInterval(() => {
            let playerPositions: CarPositionInfo[] = currentRaceSimulation.raceInfo.Results.positions;
            this.shuffleArray(playerPositions);
            playerPositions.forEach(this.updateRaceProgressStatus(currentRaceSimulation));
            ++counter;

            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
            console.log("current status of the race tracker is : ");
            /**
               Basically console.log will not go through long and complex object, and may decide to just print [Object] instead.
               JSON.stringify trick can be used to get the whole structure of the object, but that would not look pleasant to the eyes
               A good way to prevent that in node.js is to use core module in nodejs 'util' so below is example of using 'util.inspect'
             */
            console.log(util.inspect(this.raceTracker, { depth: null }));
            // console.log(JSON.stringify(this.raceTracker));
        }, this.TIMER_INTERVAL);

        return true;
    }


    updateRaceProgressStatus(currentRaceSimulation: RaceSimulation) {

        return (carPositionInfo: CarPositionInfo) => {
            let { speed, distanceTravelled, acceleration, topSpeed, id } = carPositionInfo;
            const currentTrackLength: number = currentRaceSimulation.raceInfo.Track.length;
            if (distanceTravelled < currentTrackLength) {

                const oldSpeed: number = speed;
                let speedIncreaseTimes = 1;
                const playerActivityInfo: HumanPlayerActivityInfo = currentRaceSimulation.humanPlayers[id];
                if (playerActivityInfo) {
                    const currentTime: number = new Date().getTime();
                    let timeStampts = playerActivityInfo.accelerationAttempts;
                    speedIncreaseTimes = 0;
                    const n = timeStampts.length;
                    const maxTimes = Math.floor(Math.random() * (2)) + 1;
                    let k = Math.min(timeStampts.length, maxTimes);
                    for (let i = n - 1; k > 0; --i) {
                         // if current time and last time accelerated diff is greater than specified timer i.e 1 second here
                        if (currentTime - timeStampts[i].getTime() > this.TIMER_INTERVAL) {
                            break;
                        }
                        ++speedIncreaseTimes;
                        --k;
                    }
                    timeStampts.splice(0, n);
                    if (speedIncreaseTimes == 0) {
                        speedIncreaseTimes = 1;
                        acceleration = -acceleration;
                    }
                }

                let newSpeed = Math.min(topSpeed, Math.max(0, oldSpeed + ((speedIncreaseTimes * acceleration) * this.millSecondtoSeconds(this.TIMER_INTERVAL))));

                let distanceTravelledForInterval;
                if (oldSpeed == topSpeed) {
                    distanceTravelledForInterval = oldSpeed * this.millSecondtoSeconds(this.TIMER_INTERVAL);
                }
                else {
                    distanceTravelledForInterval = (Math.pow(newSpeed, 2) - Math.pow(oldSpeed, 2)) / (2 * acceleration);
                }

                let totalDistanceTravelled: number = distanceTravelled + distanceTravelledForInterval;

                if (totalDistanceTravelled >= currentTrackLength) {
                    newSpeed = 0;
                    totalDistanceTravelled = currentTrackLength;
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
            }

            return carPositionInfo;
        }
    }



    getRandomRealNumberRange(min: number, max: number): number {
        return Math.random() * (max - min + 1) + min;
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

        const playerActivityInfo: HumanPlayerActivityInfo = currentRaceSimulation.humanPlayers[playerId];
        const currentTime = new Date();
        playerActivityInfo.accelerationAttempts.push(currentTime);
        playerActivityInfo.lastActivity = currentTime;
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