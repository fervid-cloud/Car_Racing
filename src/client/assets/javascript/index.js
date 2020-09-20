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
        //sending of exceptions log to server in ex (exception object)
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
            }
        } catch (ex) {
            alert("Some Error occured while starting the race , race");
            //we can send exceptions object information to server for logging and error monitoring
        }
    }, false);
}

async function delay(ms) {
    try {
        return await new Promise(resolve => setTimeout(resolve, ms));
    } catch (error) {
       alert("There is some error", "please try after some time");
        //we can send exceptions object information to server for logging and error monitoring
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
        //we can send exceptions object information to server for logging and error monitoring
    }
}

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

function stringToFragment(string) {
    const renderer = document.createElement('template');
    renderer.innerHTML = string;
    return renderer.content;
}




function handleAccelerate() {

    if(store['race_id']) {
        getRace(store['race_id'])
            .then((statusResponse) => {

                console.log("The race progress is: ", store["race_completion_progress"]);

                if(statusResponse.status === "unstarted") {
                    alert("Race has not started yet, please wait for timer countdown");
                    return;
                } else if(store['racer_completion_progress'] === 100) {
                    alert("You have already completed the Race");
                    return;
                }

                accelerate(store['race_id'])
                    .then(() => {
                        console.log("acceleration was added to racer speed");
                    });
            });
        return;
    }

    alert("Race has not started yet, please wait for timer countdown");
}




/*****************************************************************************************************************************/

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


function getLiView(field) {
    return `
        <td>${field}</td>
    `;
}

function showFields(objectFields, position) {

    const result = [];
    result.push(getLiView(position));
    result.push(getLiView(objectFields['driver_name']));

    return result.join(' ');
}

function getCarInfo(objectInfo) {

   return `<ul>  <li style="display: inline-block; overflow-x: auto;">${objectInfo['driver_name']}</li>
        <li>${objectInfo['speed']} km/h</li>
        </ul>
        `;

}

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

    console.log("all tracks are", allTracksView.join(' '));
    return allTracksView.join(' ');
}

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
                    <div class="carStart">
                    
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


function getProgressReport(objectFields) {
    const percentageProgress = (objectFields['segment'] / store['race_track_length']) * 100;
    return Math.round(percentageProgress * 100) / 100;
}

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



function renderAt(element, html) {
    const node = document.querySelector(element)
    node.innerHTML = html
}



/*********************************************************************************************************************/



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

// GET request to `${SERVER}/api/tracks`
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


// GET request to `${SERVER}/api/cars`
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

// GET request to `${SERVER}/api/races/${id}`
function getRace(id) {

    return fetch(`${SERVER}/api/races/${id}`)
        .then(res => res.json())
        .catch((ex) => {
            alert("some error occured while getting race status, please try after some time");
            //we can send exceptions object information to server for logging and error monitoring
        });
}

function startRace(id) {
    return fetch(`${SERVER}/api/races/${id}/start`, {
        method: 'POST',
        ...defaultFetchOpts()
    }).catch(err => {
        alert("some error occured while initialising the race, please try after some time");
        //we can send exceptions object information to server for logging and error monitoring
    });
}

// POST request to `${SERVER}/api/races/${id}/accelerate`
function accelerate(id) {

    return fetch(`${SERVER}/api/races/${id}/accelerate`, {
        method: "POST",
        ...defaultFetchOpts()
    }).catch((ex) => {
        alert("some error occured while accelerating the car, please try after some time");
       //we can send exceptions object information to server for logging and error monitoring
        
    })

}
