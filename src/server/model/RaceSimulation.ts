import { Nullable, SetIntervalType } from "custom-type-definition";
import RaceInfo from "./RaceInfo";

export interface HumanPlayerActivityInfo {
    lastActivity: Date;
    accelerationAttempts : Date []
}

export interface RaceSimulation {
    setIntervalPointer: Nullable<SetIntervalType>;
    humanPlayers: {
        [playerId: string]: HumanPlayerActivityInfo
    };
    completedRaceCount: number;
    raceInfo: RaceInfo;
}