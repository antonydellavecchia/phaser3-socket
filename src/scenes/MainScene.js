import Phaser from 'phaser';
//import { Joystick } from '../objects/Joystick'

export default class MainScene extends Phaser.Scene {
  
  preload() {
    this.load.image('ship', 'assets/PNG/playerShip2_green.png');
    this.load.image('otherPlayer', 'assets/PNG/ufoGreen.png');
    this.load.image('powerup', 'assets/PNG/Power-ups/powerupGreen.png');

    //controller
    this.load.atlas('arcade', 'assets/virtualjoystick/skins/arcade-joystick.png', 'assets/virtualjoystick/skins/arcade-joystick.json');
  }

  create() {
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

    //this.stick = new Joystick({
    //  scene: this,
    //  x: 150,
    //  y: 150,
    //  atlas: 'arcade',
    //  holder: 'base',
    //  pin: 'stick'
    //})
      
    // controller
    //this.pad = this.plugins.add(Phaser.VirtualJoystick);
    //this.stick = this.pad.addStick(0, 0, 200, 'arcade');
    //this.stick.alignBottomLeft();
//
//    this.buttonA = this.pad.addButton(500, 520, 'arcade', 'button1-up', 'button1-down');
//    this.buttonA.onDown.add(this.pressButtonA, this);
//
//    this.buttonB = this.pad.addButton(615, 450, 'arcade', 'button2-up', 'button2-down');
//    this.buttonB.onDown.add(this.pressButtonB, this);
//
//    this.buttonC = this.pad.addButton(730, 520, 'arcade', 'button3-up', 'button3-down');
//    this.buttonC.onDown.add(this.pressButtonC, this);
    
    
    this.socket.on('newPlayer', playerInfo => {
      this.addOtherPlayers(self, playerInfo);
    });


    // add players
    this.socket.on('currentPlayers',  players => {
      Object.keys(players).forEach(id => {
        if (players[id].playerId === self.socket.id) {
          this.addPlayer(self, players[id]);
        } else {
	  this.addOtherPlayers(self, players[id]);
        }
      });
    });

    this.socket.on('disconnect',  playerId => {
      self.otherPlayers.getChildren().forEach(otherPlayer => {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });

    this.socket.on('playerMoved',  playerInfo => {
      self.otherPlayers.getChildren().forEach( otherPlayer => {
        if (playerInfo.playerId === otherPlayer.playerId) {
	  otherPlayer.setRotation(playerInfo.rotation);
	  otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });

    // adds projection to game
    this.socket.on('addObjectToGame', points => {
      var polygon = new Phaser.Geom.Polygon(points);
      graphics = self.add.graphics();
      graphics.fillStyle(0xFFFFFF, 1.0);
      graphics.fillPoints(polygon.points, true);
      self.physics.add.collider(this.ship, polygon);
      self.physics.add.collider(this.otherPlayers, polygon);

    });
    
    // add score board
    this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
    this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });
    
    this.socket.on('scoreUpdate',  scores => {
      self.blueScoreText.setText('Blue: ' + scores.blue);
      self.redScoreText.setText('Red: ' + scores.red);
    });

    // add power ups
    this.socket.on('powerupLocation',  powerupLocation => {
      console.log('powerup init');

      if (self.powerup) {
        self.powerup.x = powerupLocation.x
        self.powerup.y = powerupLocation.y
      }

      // powerup has been collected so move location
      else {
        // place power up
        self.powerup = self.physics.add.image(powerupLocation.x, powerupLocation.y, 'powerup');

        // add collection callback
        self.physics.add.overlap(self.ship, self.powerup,  () => {
	  self.socket.emit('powerupCollected');
        }, null, this);

        console.log('callback created');
      }
    }, null, self);
    
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.ship) {
      if (this.cursors.left.isDown) {
        this.ship.setAngularVelocity(-150);
      } else if (this.cursors.right.isDown) {
        this.ship.setAngularVelocity(150);
      } else {
        this.ship.setAngularVelocity(0);
      }
      
      if (this.cursors.up.isDown) {
        this.physics.velocityFromRotation(
          this.ship.rotation + 1.5,
          100,
          this.ship.body.acceleration
        );
      } else {
        this.ship.setAcceleration(0);
      }

      // emit player movement
      var x = this.ship.x;
      var y = this.ship.y;
      var r = this.ship.rotation;
      if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
        this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
      }
      
      // save old position data
      this.ship.oldPosition = {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation
      };
    }
  }

  addPlayer(self, playerInfo) {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);

    if (playerInfo.team === 'blue') {
      self.ship.setTint(0x0000ff);
    } else {
      self.ship.setTint(0xff0000);
    }

    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
  }

  addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      otherPlayer.setTint(0x0000ff);
    } else {
      otherPlayer.setTint(0xff0000);
    }
    
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
  }

}
