import { Nullable, SetIntervalType } from "custom-type-definition";
import RaceInfo from "./RaceInfo";

export interface HumanPlayerActivityInfo {
    lastActivity: number;
    accelerationAttempts : number []
}

export interface RaceSimulation {
    setIntervalPointer: Nullable<SetIntervalType>;
    humanPlayers: {
        [playerId: number]: HumanPlayerActivityInfo
    };
    completedRaceCount: number;
    raceInfo: RaceInfo;
}