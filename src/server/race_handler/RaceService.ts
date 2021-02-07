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


    /**
     *
     * @param callback
     */
    getRaceTracks(callback: Function) {
        callback(null, this.raceManager.getTracks());

    }


    /**
     *
     * @param callback
     */
    getRaceCars(callback: Function) {
        callback(null, this.raceManager.getCars());
    }


    /**
     *
     * @param raceId
     */
    getRaceInfoById(raceId: number): Nullable<CurrentRaceStatus> | ErrorResponse {
        try {
            return this.raceManager.getRaceInfoById(raceId);
        } catch (ex) {
            return this.composeError("some error while getting the info of the race", ex);
        }
    }


    /**
     *
     * @param createRequestRaceInfo
     */
    createRace(createRequestRaceInfo: {playerId: number, trackId: number}): Nullable<RaceInfo> | ErrorResponse {

        try {
            const { playerId, trackId } = createRequestRaceInfo;
            return this.raceManager.createNewRace(playerId, trackId);

        } catch (ex) {
            return this.composeError("some error occured while creating the race", ex);
        }
    }


    /**
     *
     * @param raceId
     * @param callback
     */
    startRaceById(raceId: number, callback: Function) {
        let error = null, response = null;
        try {
            response = this.raceManager.startRaceById(raceId);
        } catch (ex) {
            error = this.composeError("some error occured while starting the race", ex);
        } finally {
            callback(error, response);
        }
    }


    /**
     *
     * @param raceId
     * @param playerId
     * @param callback
     */
    accelerateCar(raceId: number, playerId: number, callback: Function) {
        let error = null, response = null;
        try {
            response = this.raceManager.accelerateCar(raceId, playerId);
        } catch (ex) {
            error = this.composeError("some error occured while accelerating the race", ex);
        } finally {
            callback(error, response);
        }
    }


    /**
     *
     * @param errorMessage
     * @param ex
     */
    composeError(errorMessage: string, ex: Error): ErrorResponse {
        return {
            error: errorMessage,
            reason: ex.message
        }
    }

}
