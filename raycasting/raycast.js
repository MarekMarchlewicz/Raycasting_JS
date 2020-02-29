const TILE_SIZE = 64;
const MINIMAP_SCALE_FACTOR = 0.2;
const SCALED_TILE_SIZE = TILE_SIZE * MINIMAP_SCALE_FACTOR;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const DEBUG_RAY_LENGTH = 30;
const ALPHA_DIST_FALLOFF = 50000;

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
                var tileX = j * SCALED_TILE_SIZE; 
                var tileY = i * SCALED_TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(tileX, tileY, SCALED_TILE_SIZE, SCALED_TILE_SIZE);
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
        circle(this.x * MINIMAP_SCALE_FACTOR, this.y * MINIMAP_SCALE_FACTOR, this.radius * MINIMAP_SCALE_FACTOR);
        line(this.x * MINIMAP_SCALE_FACTOR, this.y * MINIMAP_SCALE_FACTOR, this.x * MINIMAP_SCALE_FACTOR + Math.cos(this.rotationAngle) * 10 * MINIMAP_SCALE_FACTOR, this.y * MINIMAP_SCALE_FACTOR + Math.sin(this.rotationAngle) * 10 * MINIMAP_SCALE_FACTOR);
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
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;

        this.isFacingDown = this.rayAngle < Math.PI;
        this.isFacingUp = !this.isFacingDown;

        this.isFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isFacingLeft = !this.isFacingRight;
    }
    render() {
        stroke("red");
        line(player.x * MINIMAP_SCALE_FACTOR, player.y * MINIMAP_SCALE_FACTOR, this.wallHitX * MINIMAP_SCALE_FACTOR, this.wallHitY * MINIMAP_SCALE_FACTOR);
    }
    cast(){
        var xintercept, yintercept;
        var xstep, ystep;
            
        ////// Horizontal //////
        var foundHorzWallHit = false;
        var hWallHitX = 0;
        var hWallHitY = 0;
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isFacingDown ? TILE_SIZE : 0;

        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        ystep = this.isFacingUp ? -TILE_SIZE : TILE_SIZE;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= this.isFacingLeft && xstep > 0 ? -1 : 1;
        xstep *= this.isFacingRight && xstep < 0 ? -1 : 1;

        var nextHorzTouchX = xintercept;
        var nextHorzTouchY = yintercept;

        while(nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT){
            if(grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isFacingUp ? 1 : 0))){
                foundHorzWallHit = true;
                hWallHitX = nextHorzTouchX;
                hWallHitY = nextHorzTouchY;

                break;
            }
            else{
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }

        ////// Vertical //////
        var foundVertWallHit = false;
        var vWallHitX = 0;
        var vWallHitY = 0;
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isFacingRight ? TILE_SIZE : 0;

        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        xstep = this.isFacingLeft ? -TILE_SIZE : TILE_SIZE;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= this.isFacingUp && ystep > 0 ? -1 : 1;
        ystep *= this.isFacingDown && ystep < 0 ? -1 : 1;

        var nextVertTouchX = xintercept;
        var nextVertTouchY = yintercept;

        while(nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT){
            if(grid.hasWallAt(nextVertTouchX  - (this.isFacingLeft ? 1 : 0), nextVertTouchY)){
                foundVertWallHit = true;
                vWallHitX = nextVertTouchX;
                vWallHitY = nextVertTouchY;

                break;
            }
            else{
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        var hHitDist = foundHorzWallHit ? distanceBetweenPoint(player.x, player.y, hWallHitX, hWallHitY) : Number.MAX_VALUE;
        var vHitDist = foundVertWallHit ? distanceBetweenPoint(player.x, player.y, vWallHitX, vWallHitY) : Number.MAX_VALUE;

        if(vHitDist < hHitDist){
            this.wallHitX = vWallHitX;
            this.wallHitY = vWallHitY;
            this.wasHitVertical = true;
            this.distance = vHitDist;
        } else{ 
            this.wallHitX = hWallHitX;
            this.wallHitY = hWallHitY
            this.wasHitVertical = false;
            this.distance = hHitDist;
        }        
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function render3DProjectedWalls() {
    
    for(var i = 0; i < NUM_RAYS; i++){
        var ray = rays[i];

        var rayDist = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

        var distProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

        var wallStripHeight = (TILE_SIZE / rayDist) *distProjectionPlane;

        var alpha = ALPHA_DIST_FALLOFF / rayDist;
        if(alpha > 255)
            alpha = 255;
            
        if(ray.wasHitVertical)
           fill(172, 220, 255, alpha);
        else
            fill(255, 201, 172, alpha);

        noStroke();
        rect(i * WALL_STRIP_WIDTH, WINDOW_HEIGHT / 2 - wallStripHeight / 2, WALL_STRIP_WIDTH, wallStripHeight);
    }
}

function normalizeAngle(angle) {
    angle = angle % (2* Math.PI);
    if(angle < 0)
        angle += 2* Math.PI;
    return angle;
}

function distanceBetweenPoint(x1, y1, x2, y2){
    var diffX = x2 - x1;
    var diffY = y2- y1;
    return Math.sqrt(diffX * diffX + diffY * diffY);
}

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
    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];
    
    for(var i = 0; i < NUM_RAYS; i++){
        var ray = new Ray(rayAngle);
        ray.cast();

        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;
    }
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    clear(31, 31, 31, 255);

    update();

    render3DProjectedWalls();

    grid.render();
    
    for(ray of rays)
        ray.render();

    player.render();
}
