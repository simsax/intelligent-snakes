function generateGrid() {
	let cols = floor(width/gridSize);
	let rows = floor(height/gridSize);
	for (let i=0; i<rows; i++) {
		for (let j=0; j<cols; j++) {
			let cell = {x: j*gridSize, y: i*gridSize}; 
			grid.push(cell);
		}
	}
}

function Food() {
	this.x = 0;
	this.y = 0;

	this.show = () => {
		fill('#EC304E');
		rect(this.x, this.y, gridSize, gridSize);
	}

	this.pickLocation = (body) => {
		let snakeCopy = [];
		snakeCopy = [...body];
		snakeCopy.sort((a,b) => {
		    if (a[1] === b[1]) {
		        return a[0]-b[0];
		    } else {
		        return a[1]-b[1];
		    }
		});
		// remove elements from the grid occupied by the snake
		snakeCopy.forEach((item, index) => { 
			let x = item[0]/gridSize;
			let y = item[1]/gridSize;
			grid.splice(floor(height/gridSize)*y + x - index, 1); 
		});

		// pic random cell not occupied by the snake
		let loc = grid[floor(random(grid.length))] 
		this.x = loc.x;
		this.y = loc.y;

		// add elements back to the grid
		snakeCopy.forEach(item => { 
			let _x = item[0]/gridSize;
			let _y = item[1]/gridSize;
			grid.splice(floor(height/gridSize)*_y + _x, 0, {x: _x*gridSize, y: _y*gridSize});
		});
	}
}

function Snake(brain, copy=false) {
	this.body = [[floor(random((width/gridSize)-2))*gridSize,floor(random((height/gridSize)-2))*gridSize],[floor(random((width/gridSize)-1))*gridSize,floor(random((height/gridSize)-1))*gridSize],[floor(random((width/gridSize)))*gridSize,floor(random((height/gridSize)))*gridSize]];
	//nn
	this.xspeed = 1;
	this.yspeed = 0;
	this.length = 3;
	this.life = 0;
	this.fitness = 0;
	this.leftalive = 200;
	this.gameOver = false;
	this.food = new Food();
	this.food.pickLocation(this.body);
	if (brain) {
		if (copy)
			this.nn = brain.copy();
		else
			this.nn = brain; // snake's 'brain'
	} else {
		this.nn = new NeuralNetwork([24, 16, 16, 4]);
	}

	this.decide = () => {
		let output = this.nn.predict(this.look());
		let maxval = 0;
		let argmax = 0;
		for (let i = 0; i < output.length; i++) {
			if (output[i] > maxval) {
				argmax = i;
				maxval = output[i];
			}
		}
		if (argmax === 0) {
			this.move(0, -1);
		} else if (argmax === 1) {
			this.move(0, 1);
		} else if (argmax === 2) {
			this.move(1, 0);
		} else if (argmax === 3) {
			this.move(-1, 0);
		} 
	}

	this.move = (x, y) => {
		//nn
		this.xspeed = x;
		this.yspeed = y;
		this.life++;
		this.leftalive--;

		let oldHead = this.body.pop();
		let head = oldHead.slice();

		head[0] += x * gridSize;
		head[1] += y * gridSize;


		if (this.headCoord().x < 0 || this.headCoord().x >= width || this.headCoord().y < 0 || this.headCoord().y >= height || this.leftalive == 0) {
			this.gameOver = true;
		}

		// snake collisions with his body
		this.body.forEach((item) => {
			if (item[0] === head[0] && item[1] === head[1]) {
				this.gameOver = true;
			}
		});

		this.body.push(oldHead);
		this.body.push(head) // add the head
		if (!this.eat()) {
			this.body.shift(); // remove first element (the tail)
		} else {
			this.food.pickLocation(this.body);
			this.length++;
			if (this.length < 10)
				this.leftalive += 200;
			else
				this.leftalive += 100;
		}
	}

	this.eat = () => {
		let head = this.headCoord();
		if (this.food.x === head.x && this.food.y === head.y)
			return true;
		else
			return false;
	}

	this.show = () => {
		fill('#23EA3F');
		this.body.forEach((item) => rect(item[0], item[1], gridSize, gridSize));
		this.food.show();
	}

	this.headCoord = () => {
		let head = this.body[this.body.length - 1];
		return {x: head[0], y: head[1]};
	}

	this.save = async (name) => {
		this.nn.save(name);
	}

	//nn
	this.mutate = () => {
		this.nn.mutate(0.1);
	}

	this.dispose = () => {
		this.nn.dispose();
	}

	//looks in 8 directions to find food,walls and its tail
	this.look = () => { 
	    let vision = [];
	    let head = this.headCoord();
	    //look left
	    let tempValues = this.lookInDirection({x:-gridSize, y:0});
	    vision[0] = tempValues[0];
	    vision[1] = tempValues[1]; 
	    vision[2] = tempValues[2];
	    //look left/up  
	    tempValues = this.lookInDirection({x:-gridSize, y:-gridSize});
	    vision[3] = tempValues[0];
	    vision[4] = tempValues[1];
	    vision[5] = tempValues[2]; // check if the tempValues change vision[0,1,2] etc
	    //look up
	    tempValues = this.lookInDirection({x:0, y:-gridSize});
	    vision[6] = tempValues[0];
	    vision[7] = tempValues[1];
	    vision[8] = tempValues[2];
	    //look up/right
	    tempValues = this.lookInDirection({x:gridSize, y:-gridSize});
	    vision[9] = tempValues[0];
	    vision[10] = tempValues[1];
	    vision[11] = tempValues[2];
	    //look right
	    tempValues = this.lookInDirection({x:gridSize, y:0});
	    vision[12] = tempValues[0];
	    vision[13] = tempValues[1];
	    vision[14] = tempValues[2];
	    //look right/down
	    tempValues = this.lookInDirection({x:gridSize, y:gridSize});
	    vision[15] = tempValues[0];
	    vision[16] = tempValues[1];
	    vision[17] = tempValues[2];
	    //look down
	    tempValues = this.lookInDirection({x:0, y:gridSize});
	    vision[18] = tempValues[0];
	    vision[19] = tempValues[1];
	    vision[20] = tempValues[2];
	    //look down/left
	    tempValues = this.lookInDirection({x:-gridSize, y:gridSize});
	    vision[21] = tempValues[0];
	    vision[22] = tempValues[1];
	    vision[23] = tempValues[2];

	    return vision;
	}

  	this.lookInDirection = (direction) => {
	    let visionInDirection = new Array(3).fill(0);

	    let position = this.headCoord();
	    let foodIsFound = false; //true if the food has been located in the direction looked
	    let bodyIsFound = false; //true if the tail has been located in the direction looked 
	    let distance = 0;
	     
	    position.x += direction.x;
	    position.y += direction.y;
	    distance +=1;

	    //look in the direction until you reach a wall
	    while (position.x >= 0 && position.y >= 0 && position.x < width && position.y < height) {
			//check for food at the position
			if (!foodIsFound && this.food.x === position.x && this.food.y === position.y) {
				visionInDirection[0] = 1;
				foodIsFound = true; // dont check if food is already found
			}
			//check for tail at the position
			if (!bodyIsFound && this.bodyCollision(position)) {
				visionInDirection[1] = 1/distance;
				bodyIsFound = true; // dont check if body is already found
	      	}

			//look further in the direction
			position.x += direction.x;
		    position.y += direction.y;
		    distance +=1;
	    }
	    //set the distance to the wall
	    visionInDirection[2] = 1/distance;

	    return visionInDirection;
  	}

  	this.bodyCollision = (position) => {
  		for (let i = 0; i < this.body.length; i++) {
  			let piece = this.body[i];
  			if (position.x === piece[0] && position.y === piece[1])
  				return true;
  		}
  		return false;
  	}

  	this.calcFitness = () => {
	    let apples = this.length-3;
	    if (apples < 7)
	    	this.fitness = this.life * 4**apples
	    else
	    	this.fitness = this.life * 4**7 * (apples-6)
  	}

  	this.crossover = (partner) => {
  		return new Snake(this.nn.crossover(partner.nn));
  	}
}
