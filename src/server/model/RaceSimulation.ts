import { Nullable, SetIntervalType } from "custom-type-definition";
import RaceInfo from "./RaceInfo";

export default interface RaceSimulation {
    setIntervalPointer: Nullable<SetIntervalType>;
    humanPlayers: {
        [playerId: number] : number
    };
    completedRaceCount: number;
    raceInfo: RaceInfo;
}