const gridSize = 15;
const dim = [600, 600]
let gameOver = false;
let grid = [];
const TOTAL = 1000;
let snakes = [];
let savedSnakes = [];
let bestSnake;
let generation;
let slider;
let start = false;
let stop = false;
let reset = 0;
let maxFitness = 0;
let globalFitness = 0;
let showone = false;

document.addEventListener('DOMContentLoaded', (event) => {
	document.getElementById('startbtn').addEventListener('click', (event) => {
		start = true;
		reset = 0;
		loop();
		if (stop) {
			let startb = document.getElementById('startbtn');
			startb.innerHTML = 'Start';
			stop = false;
		}
	});

	document.getElementById('stopbtn').addEventListener('click', (event) => {
		bestSnake.save('best-snake');
		noLoop();
		stop = true;
		if (start) {
			let startb = document.getElementById('startbtn');
			startb.innerHTML = 'Continue';
		}
	});

	document.getElementById('resetbtn').addEventListener('click', (event) => {
		start = false;
		reset++;
		loop();
		if (stop) {
			let startb = document.getElementById('startbtn');
			startb.innerHTML = 'Start';
			stop = false;
		}
	});

	document.getElementById('showbtn').addEventListener('click', (event) => {
		showone = !showone;
		loop();
		let showtnb = document.getElementById('showbtn');
		if (showone) {
			showbtn.innerHTML = 'Show all';
		} else {
			showbtn.innerHTML = 'Show one';
		}
	});
});

function displayGeneration() {
	let gen = document.getElementById('showGeneration');
	gen.innerHTML = `<h4>Generation ${generation}</h4><h4>Score: ${bestSnake.length}</h4><h4>Max fitness: ${maxFitness}</h4>`
}

async function setup() {
	const c = createCanvas(dim[0], dim[1]);
	c.parent('canvas');
	tf.setBackend('cpu');
	frameRate(30);
	generateGrid();
	// uncomment to load best snake
	//const model = await tf.loadLayersModel('localstorage://best-snake');
	for (let i = 0; i < TOTAL; i++) {
		snakes[i] = new Snake();
		// uncomment to load best snake
		//snakes[i] = new Snake(new NeuralNetwork(model, [24, 16, 16, 4]), true);
	}
	bestSnake = snakes[0];
	generation = 1;
	displayGeneration();
}

function draw() {
	if (!start) {
		if (reset === 1) {
			for (let i = 0; i < snakes.length; i++) {
				snakes[i].dispose();
			}
			snakes = [];
			for (let i = 0; i < savedSnakes.length; i++) {
				savedSnakes[i].dispose();
			}
			savedSnakes = [];
			for (let i = 0; i < TOTAL; i++) {
				snakes[i] = new Snake();
			}
			bestSnake = snakes[0];
			generation = 1;
			displayGeneration();
			reset++;
		}
		background(0);
		textSize(60);
		textAlign(CENTER, CENTER);
		fill('#44318d');
		text('Press start to begin', 300, 300);
	}
	else {
		for (let i = 0; i < snakes.length; i++) {
			if (snakes[i].gameOver) {
				savedSnakes.push(snakes.splice(i, 1)[0]);
			} else {
				snakes[i].decide();
			}
		}
		if (snakes.length === 0) {
			newGeneration();
		}
		displayGeneration();

		// drawing stuff
		background('#2C2C2C');
		if (showone) {
			snakes[0].show(); // show first snake
		} else {
			for (let i = 0; i < snakes.length; i++) {
				snakes[i].show();
			}
		}
	}
}


function newGeneration() {
	calculateFitness();
	snakes[0] = new Snake(bestSnake.nn, true);
	//snakes[0].mutate();
	//bestSnake = snakes[0];
	for (let i = 1; i < TOTAL; i++) {
		/*let parent1 = pickOne();
		let parent2 = pickOne();
		let child = parent1.crossover(parent2);
		child.mutate();
		snakes[i] = child;*/
		let snake = pickOne();
		snakes[i] = new Snake(snake.nn, true);
		snakes[i].mutate();
	}
	for (let i = 0; i < TOTAL; i++) {
		savedSnakes[i].dispose();
	}
	savedSnakes = [];
	generation++;
}

function pickOne() {
	let fitnessSum = 0;
    for (let i = 0; i < TOTAL; i++) {
      fitnessSum += savedSnakes[i].fitness;
    }

    //set random value
    let rand = floor(random(fitnessSum));
    
    //initialise the running sum
    let runningSum = 0;
    let snake;
    for (let i = 0; i < TOTAL; i++) {
      runningSum += savedSnakes[i].fitness; 
      if (runningSum > rand) {
        snake = savedSnakes[i];
        break;
      }
    }
    //let child = new Snake(snake.nn);
    //child.mutate();
    //return child;
    return snake;
}


function calculateFitness() {
	maxFitness = 0;
	let maxIndex = 0;
	for (let i = 0; i < savedSnakes.length; i++) {
		savedSnakes[i].calcFitness();
		if (savedSnakes[i].fitness > maxFitness) {
			maxIndex = i;
			maxFitness = savedSnakes[i].fitness;
		}
	}

	if (maxFitness > globalFitness) {
		globalFitness = maxFitness;
		bestSnake = new Snake(savedSnakes[maxIndex].nn, true);
	}
}
