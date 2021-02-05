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

    getRaceInfoById(raceId: string): Nullable<CurrentRaceStatus> {
        return null;
    }


    createRace(createRequestRaceInfo: {player_id: number, track_id: number}): Nullable<RaceInfo> | ErrorResponse {

        try {
            const { player_id, track_id } = createRequestRaceInfo;
            return this.raceManager.createNewRace(player_id, track_id);

        } catch (ex) {
            return {
                error: "some error occured while creating a race",
                reason: ex.message
            }
        }
    }

    startRaceById(raceId: string, callback: Function) {

    }


    accelerateCar(raceId: string, callback: Function) {

    }

}
