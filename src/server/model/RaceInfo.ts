import car from "model/Car";
import track from "model/Track";
import { CurrentRaceStatus }  from "../dto/CurrentRaceStatus";


export default interface RaceInfo {

    ID: number;
    Track: track;
    PlayerID: number;
    Cars: car[];
    Results: CurrentRaceStatus
}