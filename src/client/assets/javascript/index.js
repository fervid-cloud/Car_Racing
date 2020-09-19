// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally

const store = {
    track_id: undefined,
    racer_id: undefined,
    race_id: undefined,
    race_track_length: undefined
}

const countDownTime = 3;

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
    await onPageLoad();
    setupClickHandlers();
})

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
    }
}


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

            // Podracer form field
            reqTarget = target.customMatches('.card.podracer');
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
                return;
            }
        } catch (ex) {
            alert("Some Error occured while starting the race , race");
        }
    }, false);
}

async function delay(ms) {
    try {
        return await new Promise(resolve => setTimeout(resolve, ms));
    } catch (error) {
        console.log(error);
    }
}



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
    }
}

function runRace(raceId) {
    return new Promise((resolve, reject) => {

        let statusReponse = undefined;

        const intervalTracker = setInterval(async () => {

            statusReponse = await getRace(raceId);

            switch (statusReponse.status) {
                case "in-progress":
                    renderAt("#leaderBoard", raceInProgress(statusReponse.positions));
                    break;
                case "finished":
                    renderAt("#display_panel", resultsView(statusReponse.positions));
                    clearInterval(intervalTracker);
                    resolve(statusReponse);
                    alert("Race is finished");
                    break;
                default:
                    alert("No valid statusResponse was there");
                    clearInterval(intervalTracker);
                    reject(statusReponse);
            }
        }, 500);

    }).catch((ex) => {
        alert("Some Error occured after race has started, please try after some time");
    })
}

async function runCountdown() {
    try {
        // wait for the DOM to load
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
    } catch (error) {
       alert("Some Error occured while countdown was in progress, please try after some time");
    }
}



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
                    <p id="current${type}">You Choose This ${type}</p>
				  `;

        target.appendChild(stringToFragment(html));

        const updateProperty = `${type.toLowerCase()}_id`;
        store[updateProperty] = parseInt(target['id']);
    } catch(ex) {
        alert("Some error occured while selecting the choice, please try after some time");
    }

}

function stringToFragment(string) {
    const renderer = document.createElement('template');
    renderer.innerHTML = string;
    return renderer.content;
}


function handleAccelerate() {

    if(store['race_id']) {
        getRace(store['race_id'])
            .then((statusResponse) => {
                if(statusResponse.status === "unstarted") {
                    alert("Race has not started yet, please wait for timer countdown");
                    return;
                }
                accelerate(store['race_id'])
                    .then(() => {
                        console.log("acceleration was added to racer speed");
                    });

            })
        return;
    }

    alert("Race has not started yet, please wait for timer countdown");
}

// HTML VIEWS ------------------------------------------------

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

function renderRacerCard(racer) {
    const {
        id,
        driver_name,
        top_speed,
        acceleration,
        handling
    } = racer;

    return `
		<li class="card podracer" id="${id}">
			<h3>Driver Name - ${driver_name}</h3>
			<p>Top Speed - ${top_speed}</p>
			<p>Acceleration - ${acceleration}</p>
			<p>Handling - ${handling}</p>
		</li>
	`
}

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

function renderCountdown(count) {
    return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers" style="text-align: center; margin:auto">${count}</p>
	`
}



function renderRaceStartView(track_id) {
    return `
		<header>
			<h1>Race: ${track_id}</h1>
		</header>
		<div id="display_panel">
			<section id="leaderBoard" style="color: orange; flex-grow: 1; display: flex; flex-direction: column" >
				${renderCountdown(countDownTime)}
			</section>

			<section id="accelerate">
				<h2>Instruction</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</div>
		<div id="footer">
		<div id="footer_logo">
			<p id="footerText">RACING GAME</p>
		</div>
	</div>
	`
}


function resultsView(positions) {
    positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

    return `
        <div id="results">
            <section id="leaderboard">
                <h1>Race Results</h1>
                <table>
                    <tr id="titles">
                        <th>Race Position</th>
                        <th>Racer Name</th>
                        <th>Current Speed</th>
                        <th>Race Completion(%)</th>
                    </tr>
                 ${currentProgress(positions)}
                </table>
            </section>
            
            <div>
                <p style="text-align: center"><a href="/race">Start a new race</a></p>
            </div>
	    </div>		
	`;
}


function getColumnView(field) {
    return `
        <td>${field}</td>
    `;
}

function showFields(objectFields, position) {

    let result = [];
    result.push(getColumnView(position));
    result.push(getColumnView(objectFields['driver_name']));
    result.push(getColumnView(objectFields['speed']));
    const actualPercentage = (objectFields['segment'] / store['race_track_length']) * 100;
    const percentage = Math.round(actualPercentage * 100) / 100;
    result.push(getColumnView(percentage));

    return result.join(' ');
}


function raceInProgress(positions) {
    positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1);

    return `
        <h2>Race Progress</h2>
        <table>
			<tr id="titles">
				<th>Race Position</th>
				<th>Racer Name</th>
				<th>Current Speed</th>
				<th>Race Completion(%)</th>
			</tr>
             ${currentProgress(positions)}
        </table>
    `;
}


function currentProgress(positions) {

    const results = positions.map((element, index) => {

        if(element.id === store["racer_id"]) {
            element['driver_name'] += "(you)";

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



function renderAt(element, html) {
    const node = document.querySelector(element)
    node.innerHTML = html
}

// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000';

function defaultFetchOpts() {
    return {
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': SERVER,
        }
    }
}


function getTracks() {

    return fetch(`${SERVER}/api/tracks`)
        .then((response) => response.json())
        .then((body) => {
            return body;
        })
        .catch((ex) => {
            console.log("error occured while fetching tracks in getTracks");
            console.log(ex.message);
        });
    // GET request to `${SERVER}/api/tracks`
}

function getRacers() {

    return fetch(`${SERVER}/api/cars`)
        .then(response => response.json())
        .then((body) => {
            return body;
        })
        .catch(((ex) => console.log(ex.message)));
    // GET request to `${SERVER}/api/cars`
}

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
        .catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
    // GET request to `${SERVER}/api/races/${id}`
    return fetch(`${SERVER}/api/races/${id}`)
        .then(res => res.json())
        .catch((ex) => {
            console.log("exception at getRace status function");
            console.log(ex.message);
        });
}

function startRace(id) {
    return fetch(`${SERVER}/api/races/${id}/start`, {
        method: 'POST',
        ...defaultFetchOpts()
    }).catch(err => console.log("Problem with getRace request::", err))
}

function accelerate(id) {

    return fetch(`${SERVER}/api/races/${id}/accelerate`, {
        method: "POST",
        ...defaultFetchOpts()
    }).catch((ex) => {
        console.log("error occured while accelerating the car");
        console.log(ex.message);
    })
    // POST request to `${SERVER}/api/races/${id}/accelerate`
    // options parameter provided as defaultFetchOpts
    // no body or datatype needed for this request
}
