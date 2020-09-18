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
                console.log("reached at tracks then");
                const html = renderTrackCards(tracks);
                renderAt('#tracks', html);
            });

        await getRacers()
            .then((racers) => {
                console.log("reached at car also");
                const html = renderRacerCars(racers);
                renderAt('#racers', html);
            });

    } catch (error) {
        console.log("Problem getting tracks and racers ::", error.message)
        console.error(error)
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
        const {
            target
        } = event;
        console.log("a click was there");
        console.log("click info ", target);

        // Race track form field
        //const reqElement = event.checkInDom("card track");

        let reqTarget = target.customMatches(".card.track");
        if (reqTarget) {
            console.log("there was match in track");
            handleSelection(reqTarget, "Track");
            return;
        }

        // Podracer form field
        reqTarget = target.customMatches('.card.podracer');
        if (reqTarget) {
            console.log("there was match in podracer");
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

    }, false);
}

async function delay(ms) {
    try {
        return await new Promise(resolve => setTimeout(resolve, ms));
    } catch (error) {
        console.log("an error shouldn't be possible here");
        console.log(error);
    }
}


// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
    // render starting UI
    renderAt('#bottom', renderRaceStartView(store["track_id"]));

    // TODO - Get racer_id and track_id from the store
    const {
        racer_id,
        track_id
    } = store;
    console.log("track id is ", track_id);
    // const race = TODO - invoke the API call to create the race, then save the result
    const race = await createRace(racer_id, track_id);
    console.log("The race is ", race);

    // TODO - update the store with the race id
    store['race_id'] = parseInt(race['ID']) - 1;

    store['race_track_length'] = race['Track']['segments'].length;

    console.log("updated race_id in store is ", store['race_id']);

    // The race has been created, now start the countdown
    // TODO - call the async function runCountdown
    await runCountdown();

    // TODO - call the async function startRace
    console.log("reached here after countdown");
    const startRaceResponse = await startRace(store['race_id']);
    console.log(startRaceResponse);
    // TODO - call the async function runRace
    await runRace(store['race_id']);
}

function runRace(raceId) {
    return new Promise((resolve, reject) => {

        let statusReponse = undefined;

        const intervalTracker = setInterval(async () => {

            statusReponse = await getRace(raceId);
            console.log("CURRENT POSITION IS ", statusReponse.positions);

            switch (statusReponse.status) {
                case "in-progress":
                    renderAt("#leaderBoard", raceInProgress(statusReponse.positions));
                    break;
                case "finished":
                    renderAt("#display_panel", resultsView(statusReponse.positions));
                    clearInterval(intervalTracker);
                    resolve(statusReponse);
                    break;
                default:
                    console.log("No valid statusResponse was there");
                    clearInterval(intervalTracker);
                    reject(statusReponse);
            }

        }, 500);

    }).catch((ex) => {
        console.log("some error occured while starting and running the race");
        console.log(ex.message);
    })
    // TODO - use Javascript's built in setInterval method to get race info every 500ms
    /*
        TODO - if the race info status property is "in-progress", update the leaderboard by calling:
        renderAt('#leaderBoard', raceProgress(res.positions))
    */
    /*
        TODO - if the race info status property is "finished", run the following:
        clearInterval(raceInterval) // to stop the interval from repeating
        renderAt('#race', resultsView(res.positions)) // to render the results view
        reslove(res) // resolve the promise
    */
    // remember to add error handling for the Promise
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
                console.log(timer);
                if (timer === 0) {
                    clearInterval(tracker);
                    resolve(timer);
                }

            }, 1000);

        });
    } catch (error) {
        console.log(error);
    }

    // TODO - use Javascript's built in setInterval method to count down once per second
    // run this DOM manipulation to decrement the countdown for the user
    // TODO - if the countdown is done, clear the interval, resolve the promise, and return
}



function handleSelection(target, type) {
    const reqClassName = `selected${type}`;
    console.log("the traget element is", target);
    console.log("the selected element classname is ", reqClassName)

    const oldClass = document.querySelector(`.${reqClassName}`);
    const oldId = document.querySelector(`#current${type}`);
    console.log("old class is ", oldClass);
    console.log("old Id is", oldId);

    if (oldClass && oldId) {
        oldClass.classList.remove(reqClassName);
        oldId.remove();

    }

    target.classList.add(reqClassName);
    console.log("updated classList", target.classList);
    const html = `
                    <p id="current${type}">You Choose This ${type}</p>
				  `;

    target.appendChild(stringToFragment(html));
    console.log("updated target element is", target);

    // TODO - save the selected track id and racer_id to the store
    const updateProperty = `${type.toLowerCase()}_id`;
    store[updateProperty] = parseInt(target['id']);
    console.log(`Inserting the ${updateProperty} :`, store[updateProperty]);

}

function stringToFragment(string) {
    const renderer = document.createElement('template');
    renderer.innerHTML = string;
    return renderer.content;
}




function handleAccelerate() {
    console.log("accelerate button clicked");
    accelerate(store['race_id'])
        .then(() => {
            console.log("acceleration attempt is done");
        });
    // TODO - Invoke the API call to accelerate
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

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
				<h2>Hint</h2>
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

    console.log(result);
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
    console.log("In race progress , racer_id shown is", store["racer_id"]);

    /*   let userPlayer = positions.find(e => e.id === store["racer_id"]);
       userPlayer.driver_name += " (you)";*/



    const results = positions.map((element, index) => {
        console.log("element is", element);
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

// ^ Provided code ^ do not remove


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

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

function getTracks() {

    return fetch(`${SERVER}/api/tracks`)
        .then((response) => response.json())
        .then((body) => {
            console.log("tracks are ", body);
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
            console.log("cars are ", body);
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
            console.log("going to send response");
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
    }) //.then(res => res.json())
        .catch(err => console.log("Problem with getRace request::", err))
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
