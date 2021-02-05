import Container, { Service } from 'typedi';
import { CurrentRaceStatus } from 'dto/CurrentRaceStatus';
import ErrorResponse from 'dto/ErrorResponse';
import RaceInfo from 'model/RaceInfo';
import { Nullable } from '../custom-type-definition'
import RaceManager from './RaceManager';

@Service()
export default class RaceService {

    private raceManager: RaceManager

    constructor() {
        this.raceManager = Container.get(RaceManager);
    }


    getRaceTracks(callback: Function) {
        callback(null, this.raceManager.getTracks());

    }


    getRaceCars(callback: Function) {
        callback(null, this.raceManager.getCars());
    }


    getRaceInfoById(raceId: number): Nullable<CurrentRaceStatus> | ErrorResponse {
        try {
            return this.raceManager.getRaceInfoById(raceId);
        } catch (ex) {
            return this.composeError("some error while getting the info of the race", ex);
        }
    }


    createRace(createRequestRaceInfo: {playerId: number, trackId: number}): Nullable<RaceInfo> | ErrorResponse {

        try {
            const { playerId, trackId } = createRequestRaceInfo;
            return this.raceManager.createNewRace(playerId, trackId);

        } catch (ex) {
            return this.composeError("some error occured while creating the race", ex);
        }
    }


    startRaceById(raceId: number, callback: Function) {
        let error = null, response = null;
        try {
            response = this.raceManager.startRaceById(raceId);
        } catch (ex) {
            error = new Error("Race Couldn't be started");
        } finally {
            callback(error, response);
        }
    }


    accelerateCar(raceId: number, callback: Function) {
        let error = null, response = null;
        try {
            response = this.raceManager.startRaceById(raceId);
        } catch (ex) {
            error = new Error("some error occured while accelerating the car");
        } finally {
            callback(error, response);
        }
    }



    composeError(errorMessage: string, ex: Error): ErrorResponse {
        return {
            error: errorMessage,
            reason: ex.message
        }
    }

}
