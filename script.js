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
	
	if (BOARD[r][c].occupied) {
		if (SELECTED[c]==1) {
			SELECTED[c] = 0;
			BOARD[r][c].button.classList.remove("selected");
		} else {
			SELECTED[c] = 1
			BOARD[r][c].button.classList.add("selected");
		}
	}	
}

function assignPoints(n) {
	let newPoints = [...POINTS[POINTS.length-1]];
	
	for (c=1; c<=20; c++) {
		if (SELECTED[c] == 1) {
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
	for (c=1; c<=20; c++) {
		if (SELECTED[c] == 1) {
			POINTS[POINTS.length-1][c] = 1000;
			SELECTED[c] = 0;
		}
	}
	saveGame();
	drawBoard();
}

function undo() {
	POINTS.pop();
	LASTUPDATE = Array(21).fill(0);
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

function drawBoard() {
	let currentPoints = [...POINTS[POINTS.length-1]];
	let minPoint = Math.min(...currentPoints);
	FIRSTROWPOINT = minPoint - minPoint % 5;
	for (let r = 0; r <= 15; r++) {
		// write numbers in points column
		let pointValue = FIRSTROWPOINT + r
		let id = "square" + String(r).padStart(2,'0') + "00";
		el = document.getElementById(id);
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
	for (c=1; c<=20; c++) {	
		for (let r = 0; r <= 15; r++) {
			BOARD[r][c].button.classList.remove("selected")
			BOARD[r][c].button.classList.remove("occupied")
			BOARD[r][c].button.classList.remove("lastupdate")
			BOARD[r][c].occupied = false;
			BOARD[r][c].button.innerText = "";
			if (r + FIRSTROWPOINT == POINTS[POINTS.length-1][c]) {
				BOARD[r][c].button.classList.add("occupied")
				BOARD[r][c].occupied = true;
				BOARD[r][c].button.innerText = c;
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
let FIRSTROWPOINT = 0;
window.onload = setup;






