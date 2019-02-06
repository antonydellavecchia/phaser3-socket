var maptastic = null;
var layout = null;

var createComponent = function (name) {
  component = document.createElement('div');
  component.setAttribute("id", name);
  
  return component;
};

var emptyComponent = createComponent("empty");
document.body.appendChild(emptyComponent);


var onChangeHandler = function() {
  
  return null;
};

var configObject = {
  autoSave: false,
  autoLoad: false,
  onchange: onChangeHandler,
  layers: ["phaser-example", "empty"]
};

var getGameLayout = function(e) {
  console.log('get game layout');
  var layout = this.maptastic.getLayout();

  for (var component in layout) {
    switch(layout[component].id) {
      case "phaser-example":
	var game = {
	  sourcePoints: layout[component].sourcePoints,
	  targetPoints: layout[component].targetPoints,
	  width:  layout[component].sourcePoints[1][0],
	  height: layout[component].sourcePoints[2][1],
	  origin: layout[component].targetPoints[0],
	}
	break;

      case "empty":
	var empty = {
	  points: layout[component].targetPoints,
	}
	break;
    }
  }

  var points = [];

  empty.points.forEach(function(point) {
    points.push((point[0] - game.origin[0]) * game.width / window.innerWidth ); // x coord
    points.push((point[1] - game.origin[1]) * game.height / window.innerHeight ); // y coord
  });

  console.log(points)
  this.socket.emit('addProjection', points)

};

window.onload = function() {
  this.socket = io();
  console.log('window loaded');
  window.maptastic = Maptastic(configObject);
};


