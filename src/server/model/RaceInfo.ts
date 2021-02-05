
import track from "model/Track";
import { CurrentRaceStatus }  from "../dto/CurrentRaceStatus";
import Car from "./Car";

export default interface RaceInfo {
    ID: number;
    Track: track;
    PlayerID: number; //host player of the race
    Cars: Car[];
    Results: CurrentRaceStatus
}