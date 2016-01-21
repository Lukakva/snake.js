window.requestAnimFrame = function() {
    return (
        window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

function applyCSS(elements, cssJSON) {

	if (elements.length === undefined) elements = [elements];

	for (var i = 0; i < elements.length; i++) {
		for (var key in cssJSON) {
			var value = cssJSON[key];
			elements[i].style[key] = value;
		}
	}
}

var DIRECTION_LEFT  = 0,
	DIRECTION_UP    = 1 << 0,
	DIRECTION_RIGHT = 1 << 1,
	DIRECTION_DOWN  = 1 << 2;

var ARROW_LEFT  = 37,
	ARROW_UP    = 38,
	ARROW_RIGHT = 39,
	ARROW_DOWN  = 40;



function Snake(params) {
	var allowedParams = {
		node: null,
		speed: 10,
		snakeColor: "#000",
		backgroundColor: "#fff",
		foodColor: "#000",
		gridX: 10,
		gridY: 10,
		initialSize: 5,
		accelerationRatePerScore: 0.2,
		growsEveryNthFood: 10,
		maxSizeInPercents: "90%" // max size of snake with percents (percent of WHOLE grid) 
	};

	for (var param in params) {
		if (allowedParams.hasOwnProperty(param)) allowedParams[param] = params[param];
	}

	if (!allowedParams.node) return {error: "Could not initialize snake object since no node was provided in arguments JSON"};

	var canvasWrapper = document.createElement("div");
	var canvas        = document.createElement("canvas");
	var ctx           = canvas.getContext("2d");
	allowedParams.node.appendChild(canvasWrapper);
	canvasWrapper.appendChild(canvas);

	var widthAndHeight = allowedParams.node.clientHeight <= allowedParams.node.clientWidth ?  allowedParams.node.clientHeight : allowedParams.node.clientWidth;

	applyCSS(canvasWrapper, {
		width: allowedParams.node.clientWidth,
		height: allowedParams.node.clientHeight,
		position: "relative" // to keep control panel buttons inside
	});

	canvas.width  = widthAndHeight;
	canvas.height = widthAndHeight;

	canvas.style.backgroundColor = allowedParams.backgroundColor;

	this.canvas        = canvas;
	this.ctx           = ctx;
	this.canvasWrapper = canvasWrapper;

	for (var param in allowedParams) {
		this[param] = allowedParams[param];
	}

	this.init();
}

Snake.prototype = {
	grids: [],
	paused: true,
	// queue of keydowns
	keyDowns: {},
	direction: DIRECTION_LEFT,
	snakeComponents: [],
	initGrid: function() {
		var gridWidth   = parseFloat((this.canvas.width / this.gridX).toFixed(2));
		var gridHeight  = parseFloat((this.canvas.height / this.gridY).toFixed(2));
		
		this.gridWidth  = gridWidth;
		this.gridHeight = gridHeight;

		for (var x = 0; x < this.gridY; x++) {
			for (var y = 0; y < this.gridX; y++) {
				this.grids.push({
					x: x,
					y: y,
					position: {
						top   : y * gridHeight,
						left  : x * gridWidth,
						bottom: (y + 1) * gridHeight,
						right : (x + 1) * gridWidth
					}
				});
			}
		}
	},
	fillGrid: function(x, y) {
		this.ctx.fillStyle = this.snakeColor;

		this.ctx.fillRect(
			x * this.gridWidth,
			y * this.gridHeight,
			this.gridWidth,
			this.gridHeight
		);
	},
	fillFood: function() {
		var x = this.food.x;
		var y = this.food.y;

		var beginX = (x + 0.5) * this.gridWidth;
		var beginY = (y + 0.5) * this.gridHeight;
		var radius = this.gridWidth / 3;

		this.ctx.globalCompositeOperation = "destination-over";

		this.ctx.beginPath();
		this.ctx.arc(beginX, beginY, radius, 0, Math.PI * 2);
		this.ctx.closePath();

		this.ctx.fillStyle = this.foodColor;
		this.ctx.fill();

		this.ctx.globalCompositeOperation = "source-over";
	},
	initControlPanel: function() {
		var pauseButton      = document.createElement("div");
		var pauseButtonLeft  = document.createElement("span");
		var pauseButtonRight = document.createElement("span");

		applyCSS(pauseButton, {
			"height": "15px",
			"width": "15px",
			"position": "absolute",
			"bottom": "5px",
			"left": "5px"
		});

		applyCSS([pauseButtonLeft, pauseButtonRight], {
			"display": "block",
			"height": "13px",
			"width": "5px",
			"border": "1px solid rgba(0, 0, 0, 0.2)",
			"background": "rgb(220, 220, 220)"
		});

		pauseButtonLeft.style.float  = "left";
		pauseButtonRight.style.float = "right";

		pauseButton.appendChild(pauseButtonLeft);
		pauseButton.appendChild(pauseButtonRight);

		var snake = this;

		pauseButton.onmouseover = function() {
			applyCSS(this.children, {
				background: "rgb(240, 240, 240)"
			});
		}

		pauseButton.onmouseout  = function() {
			applyCSS(this.children, {
				background: "rgb(220, 220, 220)"
			});
		}

		pauseButton.onmousedown = function() {
			applyCSS(this.children, {
				background: "white"
			});
		}

		pauseButton.onmouseup   = function() {
			applyCSS(this.children, {
				background: "rgb(240, 240, 240)"
			});
		}

		pauseButton.onclick     = function() {
			snake.paused = !snake.paused;
		}

		this.canvasWrapper.appendChild(pauseButton);
	},
	initSnake: function() {
		// calculate snake position (with grids not pixels)
		var position = {
			x: Math.floor((this.gridX - this.initialSize) / 2),
			y: Math.floor((this.gridY - 1) / 2)
		};

		for (var x = position.x; x < position.x + this.initialSize; x++) {
			this.snakeComponents.push({
				x: x,
				y: position.y
			});
		}
	},
	initKeyboard: function() {
		var snake = this;

		document.onkeydown = function(e) {
			var keyCode = e.keyCode || e.which;
			snake.keyDowns[keyCode] = true;
		}
	},
	onlose: function() {

	},
	onscoreupdate: function(score) {
		console.log(score);
	},
	snakeOverlapped: function() {
		for (var i = 0; i < this.snakeComponents.length; i++) {
			for (var k = 0; k < this.snakeComponents.length; k++) {
				var snakeComponentI = this.snakeComponents[i];
				var snakeComponentK = this.snakeComponents[k];

				// check if current grid which is at i index
				// and current grid at k index are at same poistion
				// but also make sure they are not same grids by i != k
				if (snakeComponentI.x == snakeComponentK.x && snakeComponentI.y == snakeComponentK.y && i != k) return true;
			}
		}

		return false;
	},
	maximumSnakeSize: function() {
		return Math.floor(this.gridX * this.gridY * parseFloat(this.maxSizeInPercents.replace("%", "")) / 100);
	},
	// contains int of how many frames have passed
	frameCount: 0,
	_foodEaten: 0,
	update: function() {
		// so FPS is determined by Snake.prototype.speed variable
		// so we have to calculate which frame is it and whether it should be drawn or not

		// since requestAnimationFrame is called 60 times per second
		var actualFPS = 60;
		var everyNthFrame = Math.round(60 / this.speed);

		// do this for every N-th frame
		if (!this.paused && this.frameCount % everyNthFrame === 0) {
			// determine direction
			// using else if to make sure that not every of them happen at once
			if (this.keyDowns[ARROW_LEFT]  && this.direction != DIRECTION_RIGHT) {
				this.direction = DIRECTION_LEFT;
				delete this.keyDowns[ARROW_LEFT];
			} else if (this.keyDowns[ARROW_RIGHT] && this.direction != DIRECTION_LEFT) {
				this.direction = DIRECTION_RIGHT;
				delete this.keyDowns[ARROW_RIGHT];
			} else if (this.keyDowns[ARROW_UP]    && this.direction != DIRECTION_DOWN) {
				this.direction = DIRECTION_UP;
				delete this.keyDowns[ARROW_UP];
			} else if (this.keyDowns[ARROW_DOWN]  && this.direction != DIRECTION_UP) {
				this.direction = DIRECTION_DOWN;
				delete this.keyDowns[ARROW_DOWN];
			}

			var headPosition = this.snakeComponents[0];

			// check if head is out of bounds BEFORE the view gets updated
			// so it does not seem that snake went out of the box
			if (headPosition.x < 0 || headPosition.x >= this.gridX || headPosition.y < 0 || headPosition.y >= this.gridY) {
				this.onlose();
				this.paused = true;
				this.frameCount++;
				window.requestAnimFrame(this.update.bind(this));
				return;
			}

			// fill the snake based on it's grids
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			for (var i = 0; i < this.snakeComponents.length; i++) {
				var grid = this.snakeComponents[i];
				this.fillGrid(grid.x, grid.y);
			}
			this.fillFood();

			// since view is now updated and user can see the actual snake (not previous frame snake)
			// let's check NOW if snake overlapped itself
			if (this.snakeOverlapped()) {
				this.onlose();
				this.paused = true;
				this.frameCount++;
				window.requestAnimFrame(this.update.bind(this));
				return;
			}

			// create new head position based on current one
			var newHeadPosition = JSON.parse(JSON.stringify(headPosition)); // to not create reference, but copy the object

			// apply direction to new head position
			switch (this.direction) {
				case DIRECTION_LEFT:
					newHeadPosition.x--;
					break;
				case DIRECTION_UP:
					newHeadPosition.y--;
					break;
				case DIRECTION_RIGHT:
					newHeadPosition.x++;
					break;
				case DIRECTION_DOWN:
					newHeadPosition.y++;
					break;
			};

			// remove last piece of snake and add new one to head of it to create effect that it moved
			this.snakeComponents.unshift(newHeadPosition);

			var foodEaten = headPosition.x == this.food.x && headPosition.y == this.food.y;
			if (foodEaten) {
				this.foodEaten++;
			}

			// if snake ate food, and he has eaten enough of it to grow
			var shouldGrow = foodEaten && this.foodEaten % this.growsEveryNthFood === 0;

			var canGrow = this.maximumSnakeSize() > this.snakeComponents.length;

			if (!foodEaten && !shouldGrow) {
				// if snake did not eat food at this frame, remove last element, other so that unshift and pop equal eachother out and
				// snake length is same
				// but if snake's new position will mean that it will eat something, don't remove this element so snake grows on next one
				// but only in case if this food was n-th food (divided by Snake.prototype.growsEveryNthFood)
				this.snakeComponents.pop();
			} else {
				this.spawnFood(); // this will rewrite the Snake.prototype.food object with new X and Y and on next update loop food will be drawn in that location
				if (!canGrow) {
					// if snake ate something and it SHOULD grow but it exceeds the limit, don't do it
					this.snakeComponents.pop();
				}
				this.speed = parseFloat((this.speed + this.accelerationRatePerScore).toFixed(2));
			}
		};

		this.frameCount++;

		window.requestAnimFrame(this.update.bind(this));
	},
	food: {
		x: null,
		y: null
	},
	spawnFood: function() {
		var freeGrids = [];

		// that nesting lol
		for (var x = 0; x < this.gridX; x++) {
			for (var y = 0; y < this.gridY; y++) {
				for (var i = 0; i < this.snakeComponents.length; i++) {
					if (this.snakeComponents[i].x != x && this.snakeComponents[i].y != y) {
						freeGrids.push({
							x: x,
							y: y
						});
					}
				}
			}
		}

		// after those badass loops, we have list of freeGrids and we can randomly pick free grid for food
		var randomIndex = Math.floor(Math.random() * freeGrids.length);

		this.food = freeGrids[Math.floor(Math.random() * freeGrids.length)];
	},
	init: function() {
		this.initKeyboard();
		this.initControlPanel();
		this.initGrid();
		this.initSnake();
		this.spawnFood();

		this.paused = false;

		this.update();
	}
}

Object.defineProperty(Snake.prototype, "foodEaten", {
	set: function(value) {
		this.onscoreupdate(value);
		this._foodEaten = value;
	},
	get: function() {
		return this._foodEaten;
	}
});