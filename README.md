# Initializing Snake.js
```html
<script src="path/to/snake.js"></script>
<script>
    var snake = new Snake({
        // div where canvas will be created (required)
        node: document.getElementById("snake")
    });
    
    // controlling what happens on lose
    snake.onlose = function() {
        alert("HAH! Noob!");
    }
    
    // updating the scoreboard
    snake.onscoreupdate = function(score) {
        document.getElementById("score").innerHTML = score;
    }
</script>
```

# Customization
there are some parameters which will allow you to customize how snake is initialized. Here are parameters , descriptions and their default values
```javascript
new Snake({
	node: null, // node where snake canvas will be placed (REQUIRED)
	speed: 10, // initial speed of snake (kinda FPS*)
	snakeColor: "#000", // color of the snake
	backgroundColor: "#fff", // background color of canvas
	foodColor: "#000", // color of food
	gridX: 10, // horizontal count of grids
	gridY: 10, // vertical count of grids
	initialSize: 3, // initial size of snake (in grids)
	accelerationRatePerScore: 0.1, // acceleration rate for snake per score increase
	growsEveryNthFood: 10, // how many food has to be eaten to grow
	maxSizeInPercents: "90%" // max size of snake. calculated from whole grid size
});
```
