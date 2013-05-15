/**
 * A bunch of utility functions we created.
 */
var colorVec;
var freeze = 0;
var freezeBirth = 0;
var freezeOff = 0;
// Default lighting and viewer positions
var lightPos =  [0,0,0];

function MatrixData(htmlID) { 
    this.val = 0; 
    this.inc_ = 0; 
    this.html = document.getElementById(htmlID); 
}

// adapted from HTML5 Rocks!
var context;
var bufferLoader;

function audio_init() {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    bufferLoader = new BufferLoader(
	context,
	[
	    'drums_1.wav',
	    'drums_2.wav',
	],
	finishedLoading
    );

    bufferLoader.load();
}

function playSound(buffer, time) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(time);
}

function finishedLoading(bufferList) {
    // Create two sources and play them both together.
    var source1 = context.createBufferSource();
    var source2 = context.createBufferSource();
    source1.buffer = bufferList[0];
    source2.buffer = bufferList[1];
    
    source1.connect(context.destination);
    source2.connect(context.destination);
    source1.start(0);
    source2.start(0);
}

// Quad constructor that pushes
// it to an internal 'objs' array,
// making it easier to draw
function _Quad(a,b,c,d) {
    var newQuad = new Quad(a,b,c,d);
    this.objs.push(newQuad);
    return newQuad;
}

function _Prism(a,b,c,d,e,f,g,h) {
    var newPrism = new SixSidedPrism(a,b,c,d,e,f,g,h);
    this.objs.push(newPrism);
    return newPrism;
}

function _Disk(a,b,c,d) {
    var newDisk = new Disk(a,b,c,d);
    this.objs.push(newDisk);
    return newDisk;
}

function _Cyl(a,b,c,d,e) {
    var newCyl = new Cylinder(a,b,c,d,e);
    this.objs.push(newCyl);
    return newCyl;
}

//Maze.prototype.function Piece(a,b,c,d,e,f,g,h) {
//    var newPiece = new MazePiece(a,b,c,d,e,f,g,h);
//    this.pieces.push(newPiece);
//    return newCyl;
//}

function _Torus(a,b) {
    var newTorus = new Torus(a,b);
    this.objs.push(newTorus);
    return newTorus;
}

/**
 *  Functions for high-level objects
 *  that contain arrays of shapes
 */
function _objsInitBuffers(gl_) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].initBuffers(gl_);
    }
    return this;
}

function _objsTranslate(vec_) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].translate(vec_);
    }
    return this;
}

function _objsFlip() {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].flip();
    }
    return this;
}

function _objsScale(vec) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].scale(vec);
    }
    return this;
}

function _objsRotatePos() {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].rotatePos();
    }
    return this;
}

function _objsRotateXZ() {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].rotateXZ();
    }
    return this;
}

function _objsRotateNeg() {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].rotateNeg();
    }
    return this;
}


function _objsSetShader(vec) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].setShader(vec);
    }
    return this;
}

function _objsDraw(gl_) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].draw(gl_);
    }
    return this;
}

/** 
 *  Functions for low-level objects
 *  that contain single shapes
 */
function _oInitBuffers(gl_) {
    this.o.initBuffers(gl_);
    return this;
}

function _oDraw(gl_) {
    this.o.draw(gl_);
}

function _oDrawAgain(gl_) {
    this.o.drawAgain(gl_);
}

function _oTranslate(vec_) {
    this.o.translate(vec_);
    return this;
}

function _oScale(vec_) {
    this.o.scale(vec_);
    return this;
}

function _oFlip() {
    this.o.flip();
    return this;
}

function _oRotateXZ() {
    this.o.rotateXZ();
    return this;
}

function _oRotatePos() {
    this.o.rotatePos();
    return this;
}

function _oRotateNeg() {
    this.o.rotateNeg();
    return this;
}

function _oSetShader(shader) {
    this.o.shader = shader;
    return this;
}

/*
 * switches two sets of triangle indexes around
 */
function _oInvertNorms() {
    var temp;
    for(var i = 0; i < this.o.data["index"].length; i += 3) {
	temp = this.o.data["index"][i + 2];
	this.o.data["index"][i + 2] = this.o.data["index"][i + 1];
	this.o.data["index"][i + 1] = temp;
    }
    for(var i = 0; i < this.o.data["norm"].length; i += 1) {
	this.o.data["norm"][i] = -this.o.data["norm"][i];
    }
    return this;
}

MatrixData.prototype.pause = function() { this.inc_ = 0; };
MatrixData.prototype.set = function(num) { this.val = num; };
MatrixData.prototype.setInc = function(num) {     
    this.inc_ = num; 
    this.inc();
    this.html.style.display = "inline-block"; 
};
MatrixData.prototype.inc = function() {
    this.val = (this.val + this.inc_) % 360; 
};

MatrixData.prototype.incBy = function(val) {
    this.val = (this.val + val) % 360; 
};

MatrixData.prototype.setIncZoom = function(num) { 
    this.val = this.val + num; 
    if(this.val > 180) this.val = 180;
    if(this.val < 0) this.val = 0;
};

MatrixData.prototype.setStoolHeight = function(num) { 
    this.val = this.val + num; 
    if(this.val > 4.375) this.val = 4.375;
    if(this.val < 0) this.val = 0;
};

MatrixData.prototype.dec = function() { 
    this.val = (this.val - this.inc_) % 360; };

MatrixData.prototype.reset = function() {
    this.val = 0;
    this.inc_ = 0; 
    this.html.style.display = "none"; };

MatrixData.prototype.isZero = function() {
    return(this.val === 0); };

function booleanData(htmlID){
    this.val = 1;
    this.html = document.getElementById(htmlID); 
}

booleanData.prototype.reset = function(){
    this.val = 1;
};

function toggle_element(element_name){
    var this_style = document.getElementById(element_name).style;
    this_style.display = 
	(this_style.display === "inline-block")? "none": "inline-block";
};

booleanData.prototype.toggle = function(){
    if(this.val === 0) this.val = 1;
    else this.val = 0;
    this.html.style.display = "inline-block";
};

var stoolHeight;
var rotateY;
var rotateCam;
var positionX;
var positionY;
var zoom;
var pause;
var priveledgedMode;

function resetModel() { 
    rotateY.reset(); 
    positionX.reset(); 
    positionY.reset(); 
    rotateCam.reset();
    zoom.set(45);
    pause.reset();
    stoolHeight.reset();
    priveledgedMode.reset();

}

function drawDashboard() {


    if(rotateCam.html.style.display === "inline-block") {
	rotateCam.html.innerHTML = "Rotation - Cam: " + rotateCam.val + "&deg;";
	rotateCam.inc();
    }
    if(rotateY.html.style.display === "inline-block") {
	rotateY.inc();
    }
    if(!positionX.isZero()) {
	positionX.html.innerHTML = "Position - X: " + positionX.val;
    } else {
	positionX.html.innerHTML = "";
    }
    if(!positionY.isZero()) {
	positionY.html.innerHTML = "Position - Y: " + positionY.val;
    } else {
	positionY.html.innerHTML = "";
    }
    if(priveledgedMode.html.style.display == "inline-block") {
	
	priveledgedMode.html.innerHTML = 
	    "<b>Player Controls</b> <br/>" +
	    "Arrow keys to move <br/>" +
	    "A and D to rotate";
	if(priveledgedMode.val == 1) {
	    priveledgedMode.html.innerHTML += 
	    "<br/><b>God Controls</b> <br/>" +
		"I and K to rotate up <br/>" +
		"A and D to rotate";
	    rotateY.html.innerHTML = "Rotation - Y: " + rotateY.val + "&deg;";
	}
    }

    zoom.inc();
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl_, id) {
    var shaderScript = document.getElementById(id);
    
    // Didn't find an element with the specified ID; abort.
    
    if (!shaderScript) {
	return null;
    }
    
    // Walk through the source element's children, building the
    // shader source string.
    
    var theSource = "";
    var currentChild = shaderScript.firstChild;
    
    while(currentChild) {
	if (currentChild.nodeType == 3) {
	    theSource += currentChild.textContent;
	}
	
	currentChild = currentChild.nextSibling;
    }
    
    // Now figure out what type of shader script we have,
    // based on its MIME type.
    
    var shader;
    
    if (shaderScript.type == "x-shader/x-fragment") {
	shader = gl_.createShader(gl_.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
	shader = gl_.createShader(gl_.VERTEX_SHADER);
    } else {
	return null;  // Unknown shader type
    }
    
    // Send the source to the shader object
    gl_.shaderSource(shader, theSource);
    
    // Compile the shader program
    gl_.compileShader(shader);
    
    // See if it compiled successfully
    
    if (!gl_.getShaderParameter(shader, gl_.COMPILE_STATUS)) {
	alert("An error occurred compiling the shaders: " + 
	      gl_.getShaderInfoLog(shader));
	return null;
    }    
    return shader;
}

var click_x = null;
var click_y = null;

var mouse_movement = false;

function handleMouseDown(event) {
    GLobject.has_collided += 3;
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){

	mouse_movement = !mouse_movement;
	click_x = event.clientX;
	click_y = event.clientY;
    }
}

function handleMouseUp(event) {}

function handleMouseMove(event) {
    if (mouse_movement === false) { return; }

    var move_x = event.clientX - click_x;
    var move_y = event.clientY - click_y;
    
    if((move_x < -0.2) || (move_x > 0.2))
	theMatrix.lookRight(Math.PI / 180 * 2 * ((move_x) / 3));

    if(move_y < -0.1) theMatrix.moveForward();
    else if(move_y > 0.1) theMatrix.moveBack();
/*
    if(!stadiumMode){
	if(lightWillRotate) {
	    theMatrix.lightRotate(
		Math.PI / 180 * 2 * ((newX - mouseX) / 10), 
		Math.PI / 180 * 2 * ((newY - mouseY) / 10));
	} else {
	    theMatrix.lightTranslate(
		[(newX - mouseX) / 30, 
		 (mouseY - newY) / 30, 
		 0]);
	}
	mouseX = newX;
	mouseY = newY;
    }

*/

}

var wrongKey = false;
var lightWillRotate = false;

function handleKeyDown(theEvent) {

    if(wrongKey) {
	wrongKey = false;
	document.getElementById("keyboard").innerHTML = "";
    }

    switch(theEvent.keyCode) {
	
    case 16: // shift
	theMatrix.toggleSpeed();
	break;
    case 32: // spacebar
	theMatrix.jump();
	document.getElementById("keyboard").innerHTML = 
	    "Jump!";
	break;
    case 67: // 'c' key
	theMatrix.jump_map();
	document.getElementById("keyboard").innerHTML = 
	    "View Map!";
	break;
    case 39: // ->
	theMatrix.moveLeft();
	document.getElementById("keyboard").innerHTML = 
	    "Jump!";
	break;
    case 37: // left
	theMatrix.moveRight();
	break;
    case 38: // up
	theMatrix.moveForward();
	break;
    case 40: // down
	theMatrix.moveBack();
	break;
    case 65: // a
	theMatrix.lookLeft(2);
	break;
    case 68: // d
	theMatrix.lookRight(2);
	break;	
    case 73: // i
	if(priveledgedMode.val)
	    theMatrix.lookUp();
	break;
    case 75: // k
	if(priveledgedMode.val)
	    theMatrix.lookDown();
	break;
    case 80: 
	if(freeze === 0 && (StadiumInitSeqNum === 4 && stadiumMode)){
	    freezeBirth = Math.round(new Date().getTime()/1000);
	    freeze = 1;
	    alert("Game Paused");
	}
	else if(stadiumMode && StadiumInitSeqNum===4){
	    freeze = 0;
	    freezeOff = 1;
	    alert("Game back in play");
	}
	break;
    case 87: // w
	if(priveledgedMode.val)
	    theMatrix.moveUp();
	break;
    case 83: // s
	if(priveledgedMode.val)
	    theMatrix.moveDown();
	break;
    case 112: // F1: cycle through shaders 
	FLATNORMS = !FLATNORMS;
	theCanvas.changeShaders('shader-fs', 'shader-vs');
	break;
    case 49: //1 : change ball shader
	ball_shader_selectG++;
	console.log("Ball shader: " + kNameG[ball_shader_selectG]);
	break;
    default:
	wrongKey = true;
	document.getElementById("keyboard").innerHTML = 
	    "Key " + theEvent.keyCode + " is undefined.";
	break;
    }
}

function tick() {
    requestAnimFrame(tick2);
    theCanvas.drawScene();
    // Update viewer's matrix
    theMatrix.update();
    // Update side display as well
    drawDashboard();
    if(theCanvas.resizeCounter > 0) {
	theCanvas.resizeCounter -= 1;
	if(theCanvas.resizeCounter === 0) {
	    theCanvas.resize();
	}
    }
}

function tick2() {
    requestAnimFrame(tick);
    theCanvas.drawScene();
    // Update viewer's matrix
    theMatrix.update();
    // Update side display as well
    drawDashboard();
    if(theCanvas.resizeCounter > 0) {
	theCanvas.resizeCounter -= 1;
	if(theCanvas.resizeCounter === 0) {
	    theCanvas.resize();
	}
    }
}

function expand(contentID, titleID) {
    document.getElementById("header").style.display = "none";
    document.getElementById("title2").style.display = "none";
    document.getElementById("footer").style.display = "none";

    var content = document.getElementById(contentID);
    if (content.style.display !== "inline-block") {
        content.style.display = "inline-block";
	if(titleID) {
            document.getElementById(titleID).style.color = '#555577';
        }
    } else {
        content.style.display = 'none';
	if(titleID) {
            var title = document.getElementById(titleID);
            title.style.width = '90%';
            title.style.color = '#111144';
	}
    }
}
