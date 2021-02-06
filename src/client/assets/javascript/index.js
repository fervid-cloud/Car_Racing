/**
 * holds various information frequently needed for this game player
 * @type {{trackId: undefined, raceId: undefined, raceTrackLength: undefined, racerId: undefined}}
 */
const store = {
    trackId: undefined,
    racerId: undefined,
    raceId: undefined,
    raceTrackLength: undefined
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

                if (!(store['trackId'] && store['racerId'])) {
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
        renderAt('#bottom', renderRaceStartView(store["trackId"]));

        const {racerId, trackId} = store;

        const race = await createRace(racerId, trackId);

        store['raceId'] = parseInt(race['raceId']);

        store['raceTrackLength'] = race['Track'].length;

        // The race has been created, now starting the countdown

        await runCountdown();

        await startRace(store['raceId']);

        await runRace(store['raceId']);
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

        const updateProperty = `${type.toLowerCase()}Id`;
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

    if(store['raceId']) {
        getRace(store['raceId'])
            .then((statusResponse) => {

                if(statusResponse['status'] === "unstarted") {
                    alert("Race has not started yet, please wait for timer countdown");
                    return;
                }
                if(store['racerCompletionProgress'] === 100) {
                    alert("You have already completed the Race");
                    return;
                }

                accelerate(store['raceId'])
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
        driverName,
        topSpeed,
        acceleration,
        handling
    } = racer;

    return `
		<li class="card racer" id="${id}">
			<h3>Driver Name - ${driverName}</h3>
			<p>Top Speed - ${topSpeed}</p>
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
 * @param trackId
 * @returns {string}
 */
function renderRaceStartView(trackId) {
    return `
		<header>
			<h1>Race: ${trackId}</h1>
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
    //represen the final leaderboard position like 1st rank has 1 as finalPosition, then 2 and so on..
    positions.sort((a, b) => (a.finalPosition < b.finalPosition) ? -1 : 1)

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
    result.push(getLiView(objectFields['driverName']));

    return result.join(' ');
}


/**
 *
 * @param objectInfo
 * @returns {string}
 */
function getCarInfo(objectInfo) {

    return `<ul class=driverInfo>
        <li style="display: inline-block;" title="checking">${getFormattedName(objectInfo['driverName'])}</li>
        <li>${Math.floor(objectInfo['speed'])} km/h</li>
        </ul>
        `;

}


function getFormattedName(driverName) {
    console.log("driver name is : ", driverName);
    const nameLength = driverName.length;
    let updatedName = driverName;
    if (nameLength > 15) {
        const firstPart = driverName.substring(0, 5);
        const secondPart = driverName.substring(nameLength - 7, nameLength);
        console.log("first part ", firstPart);
        console.log("second part: ", secondPart);
        updatedName =  firstPart+ "..." + secondPart;
    }
    console.log("updated name is : ", updatedName);
    return updatedName;
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
        if(element['id'] === store["racerId"]) {
            element['driverName'] = "(You) " + element['driverName'];
            store['racerCompletionProgress'] = currentProgress;
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
    positions = positions.sort((a, b) => (a.id < b.id) ? -1 : 1);

    const graphicalUI = `
                <h1>Race Progress</h1>
                <div id="raceArea">
                 <div class="trackView" style="background-color: inherit;">

                    <div class="progressView" style="border-radius: 3px">
                        <p> Race completion-> </p>
                    </div>

                    <div class="mainTrack" style="border: 0px">

                    </div>
                    <div class="carStart" style="background-color: inherit; border: 0px;">

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
    const percentageProgress = (objectFields['distanceTravelled'] / store['raceTrackLength']) * 100;
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
        if(element['id'] === store["racerId"]) {
            element['driverName'] += "(you)";
            store['racerCompletionProgress'] = racerProgress;

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


// no need as frontend and backend are running on same host and port
 const SERVER = '';


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
            'playerId': store['racerId']
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
 * @param playerId
 * @param trackId
 * @returns {Promise<Response | void>}
 */
function createRace(playerId, trackId) {
    const body = {
        playerId,
        trackId
    }

    return fetch(`${SERVER}/api/races`, {
        method: 'POST',
        ...defaultFetchOpts(),
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
