// Classes
class Square {
    constructor(r, c, buttonID) {
        this.r = r;
        this.c = c;
        this.button = document.getElementById(buttonID);
		if (r==0) {
			this.button.classList.add("occupied");
			this.occupied = true;
			this.button.innerText = c;
		} else {
			this.occupied = false;
		}

		this.button.onclick = () => {
			selectPlayer(buttonID);
		}
    }
	
    reset() {
        this.button.innerText = "";
    }
}

function selectPlayer(buttonID) {
	let [r,c] = buttonID2coords(buttonID);
	if (!BOARD[r][c].occupied) {
		return
	}
	let currentPoints = POINTS[POINTS.length-1];
	
	for (ci=1; ci<=20; ci++) {
		if (SELECTED[ci] && currentPoints[ci] < 0) {
			// an eliminated player is already selected, so must be preparing to return a player from elimination
			// therefore, can't select non-eliminated players
			if (POINTS[POINTS.length-1][c] >= 0) {
				window.alert("Can't select eliminated and non-eliminated players simultaneously.");
				return
			}
			break
		}
		if (SELECTED[ci] && currentPoints[ci] >= 0) {
			// a non-eliminated player is already selected, so must be preparing to assign points or eliminate
			// therefore, can't select eliminated players
			if (POINTS[POINTS.length-1][c] < 0) {
				window.alert("Can't select eliminated and non-eliminated players simultaneously.");
				return
			}
			break
		}
	}
	
	if (BOARD[r][c].occupied) {
		if (SELECTED[c]==1) {
			SELECTED[c] = 0;
		} else {
			SELECTED[c] = 1
		}
	}
	drawBoard();
}

function assignPoints(n) {
	let newPoints = [...POINTS[POINTS.length-1]];
	for (c=1; c<=20; c++) {
		if (SELECTED[c] == 1) {
			if (newPoints[c] < 0) {
				window.alert("Can't assign points to elimiated players");
				return
			}
			newPoints[c] = newPoints[c] + n;
			SELECTED[c] = 0;
			LASTUPDATE[c] = 1;
		} else {
			LASTUPDATE[c] = 0;
		}
	}
	POINTS.push(newPoints);
	saveGame();
	drawBoard();
}

function eliminate() {
	// toggle elimination status
	// eliminated players have the negative of the points they had when eliminated, so that if they are returned to play
	// their old score is resumed
	let newPoints = [...POINTS[POINTS.length-1]];
	for (c=1; c<=20; c++) {
		LASTUPDATE[c] = 0;
		if (SELECTED[c] == 1) {
			if (newPoints[c] == 0) {
				// eliminated with 0 points - player doesn't exist
				newPoints[c] = 1000;
			} else {
				// existing player who was eliminated
				newPoints[c] = -newPoints[c];
			}
			SELECTED[c] = 0;
		}
	}
	POINTS.push(newPoints);
	saveGame();
	drawBoard();

}

function undo() {
	if (POINTS.length > 1) {
		POINTS.pop();
	}
	LASTUPDATE = Array(21).fill(0);
	SELECTED = Array(21).fill(0);
	saveGame();
	drawBoard();
}

function saveGame() {
	let gamedata = {};
	gamedata.points = POINTS;
	gamedata = JSON.stringify(gamedata);
	window.sessionStorage.setItem("gamedata",gamedata);
}

function restoreGame() {
	let gamedata = window.sessionStorage.getItem("gamedata");
	if (!gamedata || gamedata == "{}") {
		let newPoints = Array(21).fill(0);
		newPoints[0] = 1000;
		POINTS = [];
		POINTS.push(newPoints);
	} else {
		gamedata = JSON.parse(gamedata);
		POINTS = gamedata.points;
	}
}

function shiftboard(n) {
	MINPOINT = MINPOINT + n;
	if (MINPOINT < 0) {
		MINPOINT = 0;
	}
	drawBoard();
}

function drawBoard() {
	let currentPoints = [...POINTS[POINTS.length-1]];
	
	// write numbers in points column & borders at multiples of 5
	for (let r = 0; r <= 15; r++) {
		let pointValue = MINPOINT + r;
		let id = "square" + String(r).padStart(2,'0') + "00";
		let el = document.getElementById(id);
		el.innerText = pointValue;
		
		// borders at multiples of 5
		id = "boardrow" + String(r).padStart(2,'0');
		el = document.getElementById(id);
		if (pointValue % 5 == 0) {
			el.classList.add("multipleOfFive");
		} else {
			el.classList.remove("multipleOfFive");
		}
	}
	
	// format board
	let elimButton = document.getElementById("eliminate");
	elimButton.innerHTML = "&#x2715;"; // draw cross
	for (c=1; c<=20; c++) {	
		for (let r = 0; r <= 15; r++) {
			BOARD[r][c].button.classList.remove("selected");
			BOARD[r][c].button.classList.remove("occupied");
			BOARD[r][c].button.classList.remove("lastupdate");
			BOARD[r][c].button.classList.remove("eliminated");
			BOARD[r][c].occupied = false;
			BOARD[r][c].button.innerText = "";
			// non-eliminated players:
			if (MINPOINT + r == currentPoints[c]) {
				BOARD[r][c].button.classList.add("occupied")
				BOARD[r][c].occupied = true;
				BOARD[r][c].button.innerText = c;
				if (SELECTED[c] == 1) {
					BOARD[r][c].button.classList.add("selected");
				}
				if (LASTUPDATE[c] == 1) {
					BOARD[r][c].button.classList.add("lastupdate")
				}
			}
			// eliminated players:
			if (currentPoints[c] < 0 && MINPOINT + r == -currentPoints[c]) {
				BOARD[r][c].button.classList.add("occupied")
				BOARD[r][c].button.classList.add("eliminated")
				BOARD[r][c].occupied = true;
				BOARD[r][c].button.innerText = c;
				if (SELECTED[c] == 1) {
					BOARD[r][c].button.classList.add("selected");
					elimButton.innerHTML = "&#x2713;"; // draw tick
				}
				if (LASTUPDATE[c] == 1) {
					BOARD[r][c].button.classList.add("lastupdate")
				}
			}
		}
	}
	
}

function setup() {
	// Create the square objects
	for (let r = 0; r <= 15; r++) {
		let thisrow = [];
		for ( let c = 1; c <= 20; c++) {
			let id = "square" + String(r).padStart(2,'0') + String(c).padStart(2,'0')
			let square = new Square(r, c, id);
			
			thisrow[c] = square;
		}
		BOARD[r] = thisrow;
	}
	restoreGame();
	drawBoard();
}



////////////////////////////////
// Utilities
////////////////////////////////
function buttonID2coords(buttonID) {
	return [+buttonID.substr(6,2),+buttonID.substr(8,2)]
}

////////////////////////////////
// Initialisation
////////////////////////////////


let BOARD = [];
let SELECTED = Array(21).fill(0);
let LASTUPDATE = Array(21).fill(0);
let POINTS;
let MINPOINT = 0;
window.onload = setup;






