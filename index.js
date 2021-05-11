const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d')
const score = document.getElementById('score')
const startGame = document.getElementById('startGame')
const div1 = document.getElementById('div1')
const div2 = document.getElementById('div2')
const gameOverScore = document.getElementById('gameOverScore')
const gameOverScoreText = document.getElementById('gameOverScoreText')

const startsound = new Audio('start.mp3')
const gamesound = new Audio('game.mp3')
const smallsound = new Audio('smallsound.mp3')
const breaksound = new Audio('breaksound.mp3')
const blastsound = new Audio('blast.mp3')
const oversound = new Audio('over.mp3')

canvas.width = innerWidth;
canvas.height = innerHeight;

setTimeout(()=>{
    startsound.play()
    startsound.loop = true
},1000)

//CREATE A PLAYER --
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

//CREATE PROJECTILES --
class Projectiles {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.X
        this.y = this.y + this.velocity.Y
    }
}

// Create Enemies --
class Enemies {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.X
        this.y = this.y + this.velocity.Y
    }
}

const friction = 0.98
// Create Particles --
class Particles {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }
    update() {
        this.draw()
        this.velocity.X *= friction
        this.velocity.Y *= friction
        this.x = this.x + this.velocity.X
        this.y = this.y + this.velocity.Y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    currentScore = 0
    score.innerHTML = currentScore
    gameOverScore.innerHTML = currentScore
}

// RANDOMISE ENEMIES --
function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * 30 + 8
        let x;
        let y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`  //Hue Saturation Lightness
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            X: Math.cos(angle),
            Y: Math.sin(angle)
        }
        enemies.push(new Enemies(x, y, radius, color, velocity))
    }, 1000);
}

//LOOPING ANIMATION --
let animationId;
let currentScore = 0;

function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    // Draw Particles
    particles.forEach((prts, indexPr) => {
        if (prts.alpha <= 0) {
            particles.splice(indexPr, 1)
        }
        else {
            prts.update()
        }
    })

    // Remove Missed Projectiles 
    projectiles.forEach((prjs, indexP) => {
        prjs.update()
        if (prjs.x + prjs.radius < 0 ||
            prjs.x - prjs.radius > canvas.width ||
            prjs.y + prjs.radius < 0 ||
            prjs.y - prjs.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(indexP, 1)
            }, 0)
        }
    })

    // Game End when Enemy touches player
    enemies.forEach((enms, indexE) => {
        enms.update()

        const dist = Math.hypot(player.x - enms.x, player.y - enms.y)
        if (dist - enms.radius - player.radius < 1) {
            setTimeout(() => {
                blastsound.play()
                cancelAnimationFrame(animationId)
                gamesound.pause()
                oversound.play()
                gamesound.currentTime=0
                div1.style.display = 'none'
                div2.style.display = 'block'
                gameOverScore.innerHTML = currentScore
                gameOverScoreText.innerHTML = 'Points'
                startGame.innerHTML = 'Play Again!'
                setTimeout(()=>{
                    startsound.play()
                },4000)
            }, 0)
        }

        //Collision b/w Projectile+Enemy
        projectiles.forEach((prjs, indexP) => {
            const dist = Math.hypot(prjs.x - enms.x, prjs.y - enms.y)
            if (dist - enms.radius - prjs.radius < 1) {
                //Create Particles
                for (let i = 0; i < enms.radius; i++) {
                    particles.push(new Particles(prjs.x, prjs.y, Math.random() * 2, enms.color, {
                        X: (Math.random() - 0.5) * (Math.random() * 6),
                        Y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }
                if (enms.radius > 20) {
                    //Increase score
                    currentScore += 100
                    score.innerHTML = currentScore
                    gsap.to(enms, { radius: enms.radius - 10 })
                    setTimeout(() => {
                        projectiles.splice(indexP, 1)
                        breaksound.play()
                    }, 0)
                }
                else {
                    //Increase score
                    currentScore += 250
                    score.innerHTML = currentScore
                    setTimeout(() => {
                        breaksound.play()
                        enemies.splice(indexE, 1)
                        projectiles.splice(indexP, 1)
                    }, 0)
                }

            }
        })
    })

}

//Generate Projectiles on CLick & Move them in Right Direction -- 
window.addEventListener('click', (e) => {
    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2)
    const velocity = {
        X: Math.cos(angle) * 4,
        Y: Math.sin(angle) * 4
    }
    smallsound.play()
    projectiles.push(new Projectiles(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})

startGame.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    startsound.pause()
    startsound.currentTime = 0
    gamesound.play()
    gamesound.loop = true
    div1.style.display = 'block'
    div2.style.display = 'none'
})


