import { Nullable, SetIntervalType } from "custom-type-definition";
import RaceInfo from "./RaceInfo";

export default interface RaceSimulation {
    setIntervalPointer: Nullable<SetIntervalType>;
    humanPlayers: {
        [player_id: string] : number
    };
    completedRaceCount: number;
    raceInfo: RaceInfo;
}