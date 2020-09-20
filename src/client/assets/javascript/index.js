/**
 * holds various information frequently needed for this game player
 * @type {{track_id: undefined, race_id: undefined, race_track_length: undefined, racer_id: undefined}}
 */
const store = {
    track_id: undefined,
    racer_id: undefined,
    race_id: undefined,
    race_track_length: undefined
}


/**
 * count down timer
 * @type {number}
 */
const countDownTime = 3;


/**
 * entry point for our script after DOM content is loaded
 */
document.addEventListener("DOMContentLoaded", async function () {
    await onPageLoad();
    setupClickHandlers();
})


/**
 * function that handles the fething of required data to user
 * @returns {Promise<void>}
 */
async function onPageLoad() {

    /*
    		If you have no return statement (or a return statement with no value),
    		the function will return undefined, resulting in a promise of undefined.
    		https://stackoverflow.com/questions/45124511/what-to-do-when-theres-nothing-to-return-in-a-promise
    	 */
    // so use of await is correct here, even though it doesn't matter here, just for learning purpose

    try {
        await getTracks()
            .then(tracks => {
                const html = renderTrackCards(tracks);
                renderAt('#tracks', html);
            });

        await getRacers()
            .then((racers) => {
                const html = renderRacerCars(racers);
                renderAt('#racers', html);
            });

    } catch (error) {
        alert("Error occured while fetching both available racers and tracks, please try after some time");
        //we can send exceptions object information to server for logging and error monitoring
    }
}


/**
 * implementation to find the ancestor element of our choice to which we want to delegate the handling of the any event
 * @param reqSelector
 * @returns {Element}
 */
Element.prototype.customMatches = function (reqSelector) {

    let curElement = this;

    while (curElement !== null) {
        if (curElement.matches(reqSelector)) {
            return curElement;
        }
        curElement = curElement.parentElement;
    }
    return curElement;
}


/**
 * handles the different type of click made by the user
 */
function setupClickHandlers() {

    document.addEventListener('click', function (event) {
        try {
            const {target} = event;

            // Race track form field
            let reqTarget = target.customMatches(".card.track");
            if (reqTarget) {
                handleSelection(reqTarget, "Track");
                return;
            }

            // racer form field
            reqTarget = target.customMatches('.card.racer');
            if (reqTarget) {
                handleSelection(reqTarget, "Racer");
                return;
            }

            // Submit create race form
            reqTarget = target.customMatches('#submit-create-race');
            if (reqTarget) {
                event.preventDefault();

                if (!(store['track_id'] && store['racer_id'])) {
                    alert("You must submit both track and race car");
                    return;
                }

                // start race
                handleCreateRace();
                return;
            }

            // Handle acceleration click
            if (target.matches('#gas-peddle')) {
                handleAccelerate();
            }
        } catch (ex) {
            alert("Some Error occured while starting the race, please try again after some time");
            //we can send exceptions object information to server for logging and error monitoring
            //we can send exceptions object information to server for logging and error monitoring
        }
    }, false);
}


/**
 * simulate a delay of provided microseconds to user
 * @param ms
 * @returns {Promise<any>}
 */
async function delay(ms) {
    try {
        return await new Promise(resolve => setTimeout(resolve, ms));
    } catch (error) {
       alert("There is some error, please try again after some time");
        //we can send exceptions object information to server for logging and error monitoring
    }
}


/**
 * handles the process of creating the race to starting the race and ui handling for race starting
 * @returns {Promise<void>}
 */
async function handleCreateRace() {

    try {
        // render starting UI
        renderAt('#bottom', renderRaceStartView(store["track_id"]));

        const {racer_id, track_id} = store;

        const race = await createRace(racer_id, track_id);

        store['race_id'] = parseInt(race['ID']) - 1;

        store['race_track_length'] = race['Track']['segments'].length;

        // The race has been created, now starting the countdown

        await runCountdown();

        await startRace(store['race_id']);

        await runRace(store['race_id']);
    } catch(ex) {
        alert("There occured some error while creating and starting the race, please try after some time");
        //we can send exceptions object information to server for logging and error monitoring
    }
}


/**
 * this function handels the live status and result of the race after race has been started
 * @param raceId
 * @returns {Promise<any>}
 */
function runRace(raceId) {
    return new Promise((resolve, reject) => {

        let statusReponse = undefined;
        const intervalTracker = setInterval(async () => {

            statusReponse = await getRace(raceId);

            switch (statusReponse['status']) {
                case "in-progress":
                    renderAt("#leaderBoard",raceInProgress(statusReponse['positions']));
                    break;
                case "finished":
                    clearInterval(intervalTracker);
                    renderAt("#display_panel", resultsView(statusReponse['positions']));
                    alert("Race is finished");
                    resolve(statusReponse['status']);
                    break;
                default:
                    alert("No response from the server, please try after some time");
                    clearInterval(intervalTracker);
                    reject(statusReponse);
            }
        }, 500);

    }).catch((ex) => {
        alert("Some Error occured after race has started, please try after some time");
        //we can send exceptions object information to server for logging and error monitoring
    })
}


/**
 * this function is to simulate countdown to user
 * @returns {Promise<any>}
 */
async function runCountdown() {
    try {
        // waiting for the DOM to load
        await delay(1000);
        let timer = countDownTime;
        return new Promise(resolve => {
            const reqElement = document.getElementById('big-numbers');
            const tracker = setInterval(() => {

                reqElement.innerHTML = `${--timer}`;

                if (timer === 0) {
                    clearInterval(tracker);
                    resolve(timer);
                }

            }, 1000);

        });
    } catch (ex) {
       alert("Some Error occured while countdown was in progress, please try after some time");
        //we can send exceptions object information to server for logging and error monitoring
    }
}


/**
 * handles the choice of user for track and car he want to choose for the race
 * @param target
 * @param type
 */
function handleSelection(target, type) {

    try {
        const reqClassName = `selected${type}`;

        const oldClass = document.querySelector(`.${reqClassName}`);
        const oldId = document.querySelector(`#current${type}`);

        if (oldClass && oldId) {
            oldClass.classList.remove(reqClassName);
            oldId.remove();
        }

        target.classList.add(reqClassName);

        const html = `
                    <p id="current${type}" style="font-size: 25px">You Choose This ${type}</p>
				  `;

        target.appendChild(stringToFragment(html));

        const updateProperty = `${type.toLowerCase()}_id`;
        store[updateProperty] = parseInt(target['id']);
    } catch(ex) {
        alert("Some error occured while selecting the choice, please try after some time");
        //we can send exceptions object information to server for logging and error monitoring
    }

}


/**
 *
 * @param string
 * @returns {DocumentFragment}
 */
function stringToFragment(string) {
    const renderer = document.createElement('template');
    renderer.innerHTML = string;
    return renderer.content;
}


/**
 * listener for acceleration button click
 */
function handleAccelerate() {

    if(store['race_id']) {
        getRace(store['race_id'])
            .then((statusResponse) => {

                if(statusResponse['status'] === "unstarted") {
                    alert("Race has not started yet, please wait for timer countdown");
                    return;
                }
                if(store['racer_completion_progress'] === 100) {
                    alert("You have already completed the Race");
                    return;
                }

                accelerate(store['race_id'])
                    .then(() => {
                        return;
                    });
                // return can be omitted from here but for learning purpose and reference for future

            });
        return;
    }
    alert("Race has not started yet, please wait for timer countdown");
}



/*****************************************************************************************************************************/

// HTML VIEWS ------------------------------------------------


/**
 *
 * @param racers
 * @returns {string}
 */
function renderRacerCars(racers) {
    if (!racers.length) {
        return `
			<h4>Loading Racers...</h4>
		`
    }

    const results = racers.map(renderRacerCard).join('');
    return `
			${results}
	`
}


/**
 *
 * @param racer
 * @returns {string}
 */
function renderRacerCard(racer) {
    const {
        id,
        driver_name,
        top_speed,
        acceleration,
        handling
    } = racer;

    return `
		<li class="card racer" id="${id}">
			<h3>Driver Name - ${driver_name}</h3>
			<p>Top Speed - ${top_speed}</p>
			<p>Acceleration - ${acceleration}</p>
			<p>Handling - ${handling}</p>
		</li>
	`
}


/**
 *
 * @param tracks
 * @returns {string}
 */
function renderTrackCards(tracks) {
    if (!tracks.length) {
        return `
			<h4>Loading Tracks...</h4>
		`
    }

    const results = tracks.map(renderTrackCard).join('')
    return ` 
			${results}

	`
}


/**
 *
 * @param track
 * @returns {string}
 */
function renderTrackCard(track) {
    const {
        id,
        name
    } = track;

    return `
		<li id="${id}" class="card track">
			<h3>Track-Name - ${name}</h3>
		</li>
	`
}


/**
 *
 * @param count
 * @returns {string}
 */
function renderCountdown(count) {
    return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers" style="text-align: center; margin:auto">${count}</p>
	`
}


/**
 *
 * @param track_id
 * @returns {string}
 */
function renderRaceStartView(track_id) {
    return `
		<header>
			<h1>Race: ${track_id}</h1>
		</header>
		<div id="display_panel">
			<section id="leaderBoard" >
				${renderCountdown(countDownTime)}
			</section>

			<section id="accelerate">
				<h2>Instruction</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Accelerate My Car!</button>
			</section>
		</div>
		<div id="footer">
		<div id="footer_logo">
			<p id="footerText">RACING GAME</p>
		</div>
	</div>
	`
}


/**
 *
 * @param positions
 * @returns {string}
 */
function resultsView(positions) {
    positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

    return `
        <div id="results">
            <section id="leaderboard" style="align-items: center">
                <h1>Race Results</h1>
                <table>
                    <tr id="titles">
                        <th>Race Position</th>
                        <th>Racer Name</th>
                    </tr>
                 ${currentProgress(positions)}
                </table>
            </section>
            
            <div>
                <p style="text-align: center"><a href="/race">Race again</a></p>
            </div>
	    </div>		
	`;
}


/**
 *
 * @param field
 * @returns {string}
 */
function getLiView(field) {
    return `
        <td>${field}</td>
    `;
}


/**
 *
 * @param objectFields
 * @param position
 * @returns {string}
 */
function showFields(objectFields, position) {

    const result = [];
    result.push(getLiView(position));
    result.push(getLiView(objectFields['driver_name']));

    return result.join(' ');
}


/**
 *
 * @param objectInfo
 * @returns {string}
 */
function getCarInfo(objectInfo) {

   return `<ul>  <li style="display: inline-block; overflow-x: auto;">${objectInfo['driver_name']}</li>
        <li>${objectInfo['speed']} km/h</li>
        </ul>
        `;

}


/**
 *
 * @param positions
 * @returns {string}
 */
function getView(positions) {
    const allTracksView = positions.map((element) => {
        const currentProgress = getProgressReport(element);
        let carInfoView = "carInfoView"
        if(element['id'] === store["racer_id"]) {
            element['driver_name'] += "     (You)";
            store['racer_completion_progress'] = currentProgress;
            carInfoView += ` myCar`;

        }
        return ` <div class="trackView">
            
                    <div class="progressView">
                        <p>${currentProgress} %</p>
                    </div>
                    
                    <div class="mainTrack">
                    
                        <div class="carView" style="top:${100 - currentProgress}%;">
                        </div> 
                        
                    </div>
                     <div class="carStart">
                    
                    </div>
                     <div class="${carInfoView}" style="font-size: 15px;">
                            ${getCarInfo(element)}
                     </div>
        </div>
        `;

    });

    return allTracksView.join(' ');
}


/**
 *
 * @param positions
 * @returns {string}
 */
function raceInProgress(positions) {
    // positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1);

    const graphicalUI = `
                <h1>Race Progress</h1>
                <div id="raceArea">
                 <div class="trackView" style="background-color: inherit;">
            
                    <div class="progressView" style="border-radius: 3px">
                        <p> Race completion-> </p>
                    </div>
                    
                    <div class="mainTrack" style="border: 0px">
                    
                    </div>
                    <div class="carStart" style="background-color: inherit">
                    
                    </div>
                     <div class="carInfoView" style="font-size: 15px; border-radius: 5px">
                           <ul>
                                 <li> Racer Name-> </li>
                                 <li> Current Speed-> </li> 
                           </ul>
                     </div>
                </div>
                ${getView(positions)}
    </div>`;

    return graphicalUI;
}


/**
 *
 * @param objectFields
 * @returns {number}
 */
function getProgressReport(objectFields) {
    const percentageProgress = (objectFields['segment'] / store['race_track_length']) * 100;
    return Math.round(percentageProgress * 100) / 100;
}


/**
 *
 * @param positions
 * @returns {string}
 */
function currentProgress(positions) {

    const results = positions.map((element, index) => {
        const racerProgress = getProgressReport(element);
        if(element['id'] === store["racer_id"]) {
            element['driver_name'] += "(you)";
            store['racer_completion_progress'] = racerProgress;

            return `
                    <tr id="you">
                        ${showFields(element, index + 1)}
                    </tr>
            `;
        }

        return `
				<tr>
                	${showFields(element, index + 1)}
				</tr>
		`;
    });

    return results.join(' ');
}


/**
 *
 * @param element
 * @param html
 */
function renderAt(element, html) {
    const node = document.querySelector(element)
    node.innerHTML = html
}


/*********************************************************************************************************************/



// API CALLS ------------------------------------------------



 const SERVER = 'http://localhost:8000';


 /* *
 * function return object of different options for sending the request to the server
 * @returns {{mode: string, headers: {"Access-Control-Allow-Origin": *, "Content-Type": string}}}
 */
function defaultFetchOpts() {
    return {
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': SERVER,
        }
    }
}

/**
 * GET request to `${SERVER}/api/tracks`
 * @returns {Promise<* | void>}
 */
function getTracks() {

    return fetch(`${SERVER}/api/tracks`)
        .then((response) => response.json())
        .then((body) => {
            return body;
        })
        .catch((ex) => {
            alert("some error occured while fetching tracks, please try after some time");
            //we can send exceptions object information to server for logging and error monitoring
        });

}


/**
 * GET request to `${SERVER}/api/cars`
 * @returns {Promise<* | void>}
 */
function getRacers() {

    return fetch(`${SERVER}/api/cars`)
        .then(response => response.json())
        .then((body) => {
            return body;
        })
        .catch(((ex) => {
            alert("some error occured while fetching cars, please try after some time");
            //we can send exceptions object information to server for logging and error monitoring
        }));
}

/***
 * POST request to `${SERVER}/api/races`
 * @param player_id
 * @param track_id
 * @returns {Promise<Response | void>}
 */
function createRace(player_id, track_id) {
    const body = {
        player_id,
        track_id
    }

    return fetch(`${SERVER}/api/races`, {
        method: 'POST',
        ...defaultFetchOpts(),
        dataType: 'jsonp',
        body: JSON.stringify(body)
    }).then((res) => {
            return res.json();
        })
        .catch(err => {
            alert("some error occured while creating the reace, please try after some time");
            //we can send exceptions object information to server for logging and error monitoring
        })
}

/**
 * GET request to `${SERVER}/api/races/${id}`
 * @param id
 * @returns {Promise<Response | void>}
 */
function getRace(id) {

    return fetch(`${SERVER}/api/races/${id}`)
        .then(res => res.json())
        .catch((ex) => {
            alert("some error occured while getting race status, please try after some time");
            //we can send exceptions object information to server for logging and error monitoring
        });
}


/**
 * POST request to `${SERVER}/api/races/${id}/start`
 * @param id
 * @returns {Promise<Response | void>}
 */
function startRace(id) {
    return fetch(`${SERVER}/api/races/${id}/start`, {
        method: 'POST',
        ...defaultFetchOpts()
    }).catch(err => {
        alert("some error occured while initialising the race, please try after some time");
        //we can send exceptions object information to server for logging and error monitoring
    });
}

/**
 * POST request to `${SERVER}/api/races/${id}/accelerate`
 * @param id
 * @returns {Promise<Response | void>}
 */
function accelerate(id) {

    return fetch(`${SERVER}/api/races/${id}/accelerate`, {
        method: "POST",
        ...defaultFetchOpts()
    }).catch((ex) => {
        alert("some error occured while accelerating the car, please try after some time");
       //we can send exceptions object information to server for logging and error monitoring
    })
}
