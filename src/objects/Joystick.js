import Phaser from 'phaser';

export class Joystick extends Phaser.GameObjects.Container {
  constructor({scene, x, y, atlas, holder, pin}) {
    super(scene, x, y, atlas, holder);
    scene.add.existing(this);
    //scene.physics.world.enableBody(this, 0);

    //this.anchor.setTo(0.5, 0.5);

    /* Pin indicator - what players think they drag */
    this.pin = scene.add.sprite(200, 200, atlas, pin);
    this.pin.physics.anchor.setTo(0.5, 0.5);
    //this.add(this.pin);
    
    /* Invisible sprite that players actually drag */
    var dragger = this.dragger = scene.physics.add.sprite(200, 200, null);
    console.log(dragger)
    //dragger.anchor.setTo(0.5, 0.5);
    dragger.width = dragger.height = this.width;
    dragger.inputEnabled = true;
    dragger.input.enableDrag(true);
    this.addChild(dragger);

    this.isBeingDragged = false;
    dragger.events.onDragStart.add(this.onDragStart, this);
    dragger.events.onDragStop.add(this.onDragStop, this);
  }

  onDragStart(){
    this.isBeingDragged = true;
  }
  
  onDragStop(){
    this.isBeingDragged = false;
    /* Reset pin and dragger position */
    this.dragger.position.setTo(0, 0);
    this.pin.position.setTo(0, 0);
  }
  
  update(){
    if (this.isBeingDragged) {
      var distance  = this.dragger.getMagnitude();
      this.pin.position.copyFrom(this.dragger);
      if (distance > 90) this.pin.setMagnitude(90);
    }
  }
}


