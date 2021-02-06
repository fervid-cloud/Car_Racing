
import track from "model/Track";
import { CurrentRaceStatus }  from "../dto/CurrentRaceStatus";
import Car from "./Car";

export default interface RaceInfo {
    raceId: number;
    Track: track;
    hostId: number; //host player of the race
    Cars: Car[];
    Results: CurrentRaceStatus;
}