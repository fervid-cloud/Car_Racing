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

    getRaceInfoById(race_id: number): Nullable<CurrentRaceStatus> | ErrorResponse {
        try {
            return this.raceManager.getRaceInfoById(race_id);
        } catch (ex) {
            return this.composeError("some error while getting the info of the race", ex);
        }
    }


    createRace(createRequestRaceInfo: {player_id: number, track_id: number}): Nullable<RaceInfo> | ErrorResponse {

        try {
            const { player_id, track_id } = createRequestRaceInfo;
            return this.raceManager.createNewRace(player_id, track_id);

        } catch (ex) {
            return this.composeError("some error occured while creating the race", ex);
        }
    }


    startRaceById(race_id: string, callback: Function) {

    }


    accelerateCar(race_id: string, callback: Function) {

    }

    composeError(errorMessage: string, ex: Error): ErrorResponse {
        return {
            error: errorMessage,
            reason: ex.message
        }
    }

}
