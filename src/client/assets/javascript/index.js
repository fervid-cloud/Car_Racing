// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally

const store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

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

	while(curElement !== null) {
		if(curElement.matches(reqSelector)) {
			return curElement;
		}
		curElement = curElement.parentElement;
	}
	return curElement;
}


function setupClickHandlers() {


	document.addEventListener('click', function (event) {
		const { target } = event;
		console.log("a click was there");
		console.log("click info ", target);

		// Race track form field
		//const reqElement = event.checkInDom("card track");

		let reqTarget = target.customMatches('.card.track');
		if(reqTarget) {
			console.log("there was match in track");
			handleSelectTrack(reqTarget);
			return;
		}

		// Podracer form field
		reqTarget = target.customMatches('.card.podracer');
		if (reqTarget) {
			console.log("there was match in podracer");
			handleSelectPodRacer(reqTarget);
			return;
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault();
			if(!(store['track_id'] && store['player_id']))  {
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
	renderAt('#race', renderRaceStartView(store["track_id"]));

	// TODO - Get player_id and track_id from the store
	const {player_id, track_id} = store;
	console.log("track id is ", track_id);
	// const race = TODO - invoke the API call to create the race, then save the result
	const race = await createRace(player_id, track_id);
	console.log("The race is ", race);

	// TODO - update the store with the race id
	store['race_id'] = parseInt(race['ID']) - 1;

	console.log("updated race_id in store is " , store['race_id']);

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
			console.log(statusReponse);

			switch(statusReponse.status) {
				case "in-progress":
					renderAt("#leaderBoard", raceProgress(statusReponse.positions));
					break;
				case "finished":
					renderAt("#race", resultsView(statusReponse.positions));
					clearInterval(intervalTracker);
					resolve(statusReponse);
					break;
				default :
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
		let timer = 3;
		return new Promise(resolve => {
			const reqElement = document.getElementById('big-numbers');
			const tracker = setInterval(() => {

				reqElement.innerHTML = `${--timer}`;
				console.log(timer);
				if(timer === 0) {
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

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id);

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if (selected) {
		selected.classList.remove('selected');
	}

	// add class selected to current target
	target.classList.add('selected');

	// TODO - save the selected racer to the store
	store['player_id'] = parseInt(target['id']);
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id);

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if (selected) {
		selected.classList.remove('selected');
	}

	// add class selected to current target
	target.classList.add('selected');
	console.log("assiging id", target.id);
	// TODO - save the selected track id to the store
	store['track_id'] = parseInt(target['id']);
}

function handleAccelerate() {
	console.log("accelerate button clicked");
	accelerate(store['race_id'])
		.then(() => {
			console.log("acceleration attemp is done");
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
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const {id, driver_name, top_speed, acceleration, handling} = racer;

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
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
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const {id, name} = track;

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	console.log("In race progress , player_id shown is", store["player_id"]);

	let userPlayer = positions.find(e => e.id === store["player_id"]);
	userPlayer.driver_name += " (you)";

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1);
	let count = 1;

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
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
			'Access-Control-Allow-Origin': SERVER
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
		.catch((ex) =>  {
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
	const body = {player_id, track_id}
	return fetch(`${SERVER}/api/races`, {
			method: 'POST',
			...defaultFetchOpts(),
			dataType: 'jsonp',
			body: JSON.stringify(body)
		})
		.then((res) => {
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
		})//.then(res => res.json())
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