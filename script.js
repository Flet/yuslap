/* global Phaser */

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

const game = new Phaser.Game(config)

let face
let hand
let flipped = false
let slapping = false
let slapped = false
let slapSound
let slapTime = 0
let particles
let leftEmitter
let rightEmitter

function preload () {
  this.load.image('face', 'face1.png')
  this.load.image('faceslapped', 'face2.png')
  this.load.image('hand', 'hand1.png')
  this.load.image('slap', 'slap.png')
  this.load.image('spit', 'particle.png')

  this.load.audio('slapsound', ['slap.mp3'])
}

function create () {
  slapSound = this.sound.add('slapsound')

  this.cameras.main.setBackgroundColor('#FFF')

  hand = this.physics.add.image(window.innerWidth / 2, window.innerHeight / 2, 'hand')

  this.input.on('pointermove', function (pointer) {
    hand.x = pointer.x
    hand.y = pointer.y
  })

  face = this.physics.add.image(window.innerWidth / 2, window.innerHeight / 2, 'face')

  const origin = face.getTopLeft()
  const textures = this.textures
  const logoSource = {
    getRandomPoint: function (vec) {
      do {
        var x = Phaser.Math.Between(0, face.width - 1)
        var y = Phaser.Math.Between(0, face.height - 1)
        var pixel = textures.getPixel(x, y, 'face')
      } while (pixel.alpha < 255)

      return vec.setTo(x + origin.x, y + origin.y)
    }
  }

  particles = this.add.particles('spit')

  leftEmitter = particles.createEmitter({
    lifespan: 1000,
    speed: { min: 600, max: 1600 },
    angle: { min: 180, max: 200 },
    gravityY: 300,
    scale: { start: 0.4, end: 0 },
    emitZone: { type: 'random', source: logoSource }
  })
  leftEmitter.stop()

  rightEmitter = particles.createEmitter({
    lifespan: 1000,
    speed: { min: 600, max: 1600 },
    angle: { min: -20, max: 0 },
    gravityY: 300,
    scale: { start: 0.4, end: 0 },
    emitZone: { type: 'random', source: logoSource }
  })
  rightEmitter.stop()
}

function update () {
  const firstThird = window.innerWidth / 3
  const lastThird = firstThird * 2

  if (hand.x < firstThird || hand.x > lastThird) {
    slapping = false

    slapped = false
    hand.setTexture('hand')

    if (slapTime > 0) {
      slapTime--
    } else {
      face.setTexture('face')
      face.setFlipX(false)
    }

    if (!flipped && hand.x < firstThird) {
      flipped = true
      hand.setFlipX(flipped)
    } else if (flipped && hand.x > firstThird) {
      flipped = false
      slapped = false
      hand.setFlipX(flipped)
    }
  }

  if (!slapping && hand.x > firstThird && hand.x < lastThird) {
    slapping = true
    hand.setTexture('slap')
  }

  if (slapping && !slapped) {
    slapped = true
    face.setTexture('faceslapped')

    slapTime = 10
    slapSound.play()

    face.setFlipX(flipped)

    if (!flipped) {
      leftEmitter.explode(20)
    } else {
      rightEmitter.explode(20)
    }
  }
}
