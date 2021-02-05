export default interface CarPositionInfo {
    id: number;
    driverName: string;
    topSpeed: number;
    acceleration: number;
    handling: number;
    finalPosition?: number;
    speed: number;
    distanceTravelled: number;
}