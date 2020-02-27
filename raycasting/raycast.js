const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const DEBUG_RAY_LENGTH = 30;

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
    hasWallAt(x, y){
        if(x < 0 || x > WINDOW_WIDTH || y  < 0 || y > WINDOW_HEIGHT)
            return true;
        var row = Math.floor(x / TILE_SIZE);
        var column = Math.floor(y / TILE_SIZE);
        return this.grid[column][row] == 1;
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
        var newX = this.x + Math.cos(this.rotationAngle) * this.moveSpeed * this.walkDirection;
        var newY = this.y + Math.sin(this.rotationAngle) * this.moveSpeed * this.walkDirection;

        if(!grid.hasWallAt(newX, newY)){
            this.x = newX;
            this.y = newY;
        }
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = rayAngle;
    }
    render() {
        stroke("red");
        line(player.x, player.y, player.x + Math.cos(this.rayAngle) * DEBUG_RAY_LENGTH, player.y + Math.sin(this.rayAngle) * DEBUG_RAY_LENGTH);
    }
    cast(){

    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
    document.addEventListener('keyup', keyUpEvent);
    document.addEventListener('keydown', keyDownEvent);
}
function keyUpEvent(e) {
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

function castAllRays()
{
    var columnId = 0;

    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    for(var i = 0; i < NUM_RAYS; i++){
        var ray = new Ray(rayAngle);
        //ray.cast();

        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;
        columnId++;
    }
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    update();

    grid.render();
    
    for(ray of rays)
        ray.render();

    player.render();
}
