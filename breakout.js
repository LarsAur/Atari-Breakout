const canvas = document.getElementById("breakoutCanvas")
const width = canvas.width;
const height = canvas.height;
const ctx = canvas.getContext("2d")

let blocks = []
let balls = []
let bumper = {}

let numblocksx = 16
let numblocksy = 5

let blockspace = 3

let blockwidth = (width - (numblocksx - 1) * blockspace) / numblocksx
let blockheight = (100 - numblocksy * blockspace) / numblocksy

let keydown = [].fill(false, 0, 222)

const layerColor = ["#33658A", "#86BBD8", "#758E4F", "#F6AE2D", "#F26419"]

window.addEventListener("load", load)

window.addEventListener("keydown", event => {
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    keydown[event.keyCode] = true
})


window.addEventListener("keyup", event => {
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    keydown[event.keyCode] = false
})


function load() {
    balls = []
    bumper = null
    blocks = []

    for (let i = 0; i < numblocksx; i++) {
        for (let j = 0; j < numblocksy; j++) {
            blocks.push({ x: i * (blockwidth + blockspace), y: j * (blockheight + blockspace) + 20 })
        }
    }

    balls.push({ x: 300, y: 300, r: 6, speed: 0.5, dx: 0, dy: 1 })
    bumper = { x: width / 2, size: 50, speed: 0.3 }
}


function gameloop(currentTime) {
    var deltaTime = currentTime - lastRenderTime
    update(deltaTime)
    draw()

    lastRenderTime = currentTime
    window.requestAnimationFrame(gameloop)
}

function update(deltaTime) {
    balls.forEach(ball => {

        //Ball wall collision 
        if (ball.x + ball.r >= width) ball.dx *= -1;
        else if (ball.x - ball.r <= 0) ball.dx *= -1;
        if (ball.y - ball.r <= 0) ball.dy *= -1;

        //Move ball
        ball.x += ball.dx * ball.speed * deltaTime
        ball.y += ball.dy * ball.speed * deltaTime

        //Ball block collision
        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i]
            let collisionData = circleRectangleCollision(ball.x, ball.y, ball.r, block.x, block.y, blockwidth, blockheight)
            if (collisionData.collided) {
                blocks.splice(i, 1)
                
                if(ball.y < block.y + blockheight && ball.y > block.y){
                    ball.dx *= -1
                }else{
                    ball.dy *= -1
                }

                break;
            }
        }

        //Ball bumper collision
        let bumperCollisionData = circleRectangleCollision(ball.x, ball.y, ball.r, bumper.x - bumper.size, height - 15, 2 * bumper.size, 15)
        if (bumperCollisionData.collided) {
            ball.dy *= -1
            ball.dx += (ball.x - bumper.x) / (2 * bumper.size)
        }

        //Normalize speed
        ball.dx = ball.dx / Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)
        ball.dy = ball.dy / Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)
    })



    //A or left
    if (keydown[65] || keydown[37]) {
        bumper.x -= bumper.speed * deltaTime
    }

    //D or right
    if (keydown[68] || keydown[39]) {
        bumper.x += bumper.speed * deltaTime
    }

    //R
    if (keydown[82]) {
        load()
    }

}

function circleRectangleCollision(cx, cy, r, rx, ry, rw, rh) {
    let testX = cx
    let testY = cy

    if (cx < rx) { testX = rx }
    else if (cx >= rx + rw) { testX = rx + rw }

    if (cy < ry) { testY = ry }
    else if (cy > ry + rh) { testY = ry + rh }

    let distX = cx - testX
    let distY = cy - testY
    let distance = Math.sqrt(distX * distX + distY * distY)

    return { collided: distance <= r }
}

function draw() {
    ctx.fillStyle = "#111111"
    ctx.fillRect(0, 0, width, height)

    blocks.forEach(block => {
        ctx.fillStyle = layerColor[(block.y - 20) / (blockheight + blockspace)]
        ctx.fillRect(block.x, block.y, blockwidth, blockheight)
    })

    ctx.fillStyle = "#eeeeee"
    balls.forEach(ball => {
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, false)
        ctx.closePath()
        ctx.fill()
    })

    ctx.fillStyle = "#cccccc"
    ctx.fillRect(bumper.x - bumper.size, height - 15, 2 * bumper.size, 15)
}

var lastRenderTime = 0
window.requestAnimationFrame(gameloop)