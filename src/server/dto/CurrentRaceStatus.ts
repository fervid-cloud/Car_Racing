import CarPositionInfo from "model/CarPositionInfo";


export interface CurrentRaceStatus {
    status: string;
    positions: CarPositionInfo[];
}