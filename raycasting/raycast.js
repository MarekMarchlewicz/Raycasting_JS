const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE; 
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        
        this.radius = 3;
        this.turnDirection = 0; // -1 = left | 1 = right
        this.walkDirection = 0; // -1 = back | 1 = forward
        this.rotationAngle = Math.PI / 2; // 90 deg
        this.moveSpeed = 1;
        this.rotationSpeed = 2 * (Math.PI / 180);
    }

    render() {
        noStroke();
        fill("blue");
        circle(this.x, this.y, this.radius);
        stroke("blue");
        line(this.x, this.y, this.x + Math.cos(this.rotationAngle) * 10, this.y + Math.sin(this.rotationAngle) * 10);
    }

    update()
    {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        this.x += Math.cos(this.rotationAngle) * this.moveSpeed * this.walkDirection;
        this.y += Math.sin(this.rotationAngle) * this.moveSpeed * this.walkDirection;
    }
}

var grid = new Map();
var player = new Player();

function keyUpEvent(e) {
    console.log(e.key);
    if(e.key =="ArrowUp"){
        player.walkDirection = 0;
    } else if(e.key == "ArrowDown") {
        player.walkDirection = 0;
    } else if(e.key == "ArrowRight") {
        player.turnDirection = 0;
    } else if(e.key == "ArrowLeft") {
        player.turnDirection = 0;
    }
}
function keyDownEvent(e)
{
    if(e.key == "ArrowUp"){
        player.walkDirection = 1;
    } else if(e.key == "ArrowDown") {
        player.walkDirection = -1;
    } else if(e.key == "ArrowRight") {
        player.turnDirection = 1;
    } else if(e.key == "ArrowLeft") {
        player.turnDirection = -1;
    }
}
function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
    document.addEventListener('keyup', keyUpEvent);
    document.addEventListener('keydown', keyDownEvent);
}

function update() {
    player.update();
}

function draw() {
    update();

    grid.render();
    player.render();
}
