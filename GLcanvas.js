/**
 * Most variables used here are
 *  defined in 'functions.js'
 */

/**
 * Object holding modelview and perspective matrices.
 */
var theMatrix;
var canvas2, gl2;
var mazeMode;
var myMaze;
var myStadium;
var stadiumMode;

function GLcanvas() {
    this.objects = [];
    this.textures = [];
    this.frames = [];
    this.canvas = document.getElementById("glcanvas");
    this.gl = null;
    theMatrix = new GLmatrix();

    colorVec = vec3.fromValues(1,1,0);
    positionX = new MatrixData("positionXStats");
    positionY = new MatrixData("positionYStats");
    rotateY = new MatrixData("rotateStats");
    rotateCam = new MatrixData("rotateCamStats");
    zoom = new MatrixData("zoomPerspectiveStats");
    zoom.set(45);
    pause = new booleanData("pause");
    stoolHeight = new MatrixData("stoolHeight");
    priveledgedMode = new booleanData("priveledgedStats");

    return this;
}

/**
   Debug mode for the canvas. Currently calls a stool.
**/
GLcanvas.prototype.debug = function() {
    if (envDEBUG == false) { return; }
    expand('title2', 'webgl_object'); 
    this.start('shadow');

    return this;
}

GLcanvas.prototype.createScene = function(objToDraw) {
    if(objToDraw == "cylinder") {
	this.objects.push(new Cylinder(1, 4, 5, 150, 150));
    } else if(objToDraw == "sphere") {
	this.objects.push(new Sphere(2));
    } else if(objToDraw == "skybox") {
	this.objects.push(new Skybox());
    } else if(objToDraw == "stool") {
	this.objects.push(new Stool());
    } else if(objToDraw == "shadow") {
	this.objects.push(new MazePiece(5, NO_LEFT, TILE_TEXTURE));
	this.objects.push(new Stool());
    } else if(objToDraw == "maze") {
	myMaze = new Maze();
	this.objects.push(myMaze);
	this.objects.push(new StoolPyramid());
	this.objects.push(new Cagebox());
	mazeMode = 1;
//	priveledgedMode.toggle();
	theMatrix.viewMaze();
    } 
    else if(objToDraw == "stadium") {
	myStadium = new Stadium();
	this.objects.push(myStadium);
	this.objects.push(new Skybox());
	theMatrix.viewStadium();
	stadiumMode = 1;
	priveledgedMode.toggle();
    } else if(objToDraw == "framebuffer") {
	this.frames.push(new GLframe(FRAME_BUFF));
	this.objects.push(new Quad(
	    [-1, 1,-4],
	    [-1,-1,-4],
	    [ 1, 1,-4],
	    [ 1,-1,-4]).invertNorms().setTexture(this.frames[0].num));

    } else if(objToDraw == "torus") {
	this.objects.push(new Torus(0.2, 2));
    }
    this.objects.push(new Light());
}

GLcanvas.prototype.bufferModels = function() {
    for(var i = 0, max = this.objects.length;
	i < max; ++i) {
	this.objects[i].initBuffers(this.gl); 
    }
}

GLcanvas.prototype.drawModels = function() {
    theMatrix.setViewUniforms(this.gl,this.shader);
    for(var i = 0, max = this.objects.length;
	i < max; ++i) {
	this.objects[i].draw(this.gl, this.shader); 
    } 
}

/**
 * Begins the canvas.
 */
GLcanvas.prototype.start = function(theScene) {

    // Instantiate the Div this canvas element is within.
    expand("webgl_settings_button");

    if (this.gl == null) {
	// One-time display methods
	this.canvas.style.display = "inline-block";
	this.canvas.style.width = "100%";
	this.canvas.width = this.canvas.offsetWidth - 16;
	this.initGL();
	this.initShaders("shader-fs", "shader-vs");
	this.initTextures();
	this.initText();
	this.initSkybox();
	theMatrix.setConstUniforms(this.gl, this.shader);

	theMatrix.viewInit();
	this.objects = [];
	priveledgedMode.reset();
	mazeMode = 0;

	// Instantiate models
	this.createScene(theScene);

	// Instantiate any framebuffers created
	for(var i = 0; i < this.frames.length; ++i) {
	    this.frames[i].init(this.gl);
	}
	this.bufferModels();

	// Set background color, clear everything, and
	//  enable depth testing
	this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
	this.gl.clearDepth(1.0);
	this.gl.enable(this.gl.DEPTH_TEST);
	
	// Set up to draw the scene periodically.
	document.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	document.onkeydown = handleKeyDown;
	tick();
    } else {
	// If we have started GL already, 
	//  just add the new model.
	this.createScene(theScene);
	this.bufferModels();
    }
}

/*
 * Initialize WebGL, returning the GL context or null if
 * WebGL isn't available or could not be initialized.
 */
GLcanvas.prototype.initGL = function() {
    try {
	this.gl = this.canvas.getContext("experimental-webgl");
	this.gl.viewportWidth = this.canvas.width;
	this.gl.viewportHeight = this.canvas.height;
    }
    catch(e) {}
    // If we don't have a GL context, give up now
    if (!this.gl) {
	alert("Unable to initialize WebGL. Your browser may not support it.");
    }
}


/**
 *  Draw the scene.
 */
GLcanvas.prototype.drawScene = function() {

    // Clear the canvas before we start drawing on it.
    var error = this.gl.getError();
    while (error != this.gl.NO_ERROR) {
	alert("error: " + error);
	error = this.gl.getError();

    }

    for(var i = 0; i < this.frames.length; ++i) {
	this.frames[i].drawScene(this.gl, this.shader);
    }

    this.gl.viewport(0, 0, 800, 800);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | 
		  this.gl.DEPTH_BUFFER_BIT);

    theMatrix.perspective(zoom.val,
			  this.gl.viewportWidth / 
			  this.gl.viewportHeight,
			  0.1, 30000.0);


//    theMatrix.modelInit();
//    if(!mazeMode)
//	theMatrix.modelUpdate();

    // Draw all our objects
    theMatrix.push();
    this.drawModels();
    theMatrix.pop();
    // Update viewer's matrix
    theMatrix.update();
    // Update side display as well
    drawDashboard();


    this.gl.clear(this.gl.STENCIL_BUFFER_BIT);

}

GLcanvas.prototype.initSkybox = function() {
    for(var i= 0; i < 6; ++i) {
	this.textures.push(new GLtexture(
	    this.gl, SKYBOX_TEXTURE_0 + i));
    }
}


GLcanvas.prototype.initText = function(){

    var canvasTexture = this.gl.createTexture();
    var textTexture = document.getElementById('textureCanvas');
    var ctx = textTexture.getContext('2d');
    var textToWrite = "HTML5 Rocks!";
    var textSize = 12;
    ctx.font = textSize+"px monospace"; // Set the font of the text before measuring the width!
    textTexture.width = getPowerOfTwo(ctx.measureText(textToWrite).width);
    textTexture.height = getPowerOfTwo(2*textSize);
//    textTexture.style.width = getPowerOfTwo(ctx.measureText(textToWrite).width);
//    textTexture.style.height = getPowerOfTwo(2*textSize);

    ctx.fillStyle = "#333333"; // This determines the text colour, it can take a hex value or rgba value (e.g. rgba(255,0,0,0.5))
    ctx.textAlign = "center";// This determines the alignment of text, e.g. left, center, right
    ctx.textBaseline = "middle";// This determines the baseline of the text, e.g. top, middle, bottom
    ctx.font = "12px monospace";// This determines the size of the text and the font family used
    ctx.fillText("HTML5 Rockss!", textTexture.width/2, textTexture.height/2);

    this.gl.activeTexture(this.gl.TEXTURE0 + TEXT_TEXTURE);

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    this.gl.bindTexture(this.gl.TEXTURE_2D, canvasTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textTexture); // This is the important line!
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
}

GLcanvas.prototype.initTextures = function() {
    this.textures.push(new GLtexture(
	this.gl, WOOD_TEXTURE));
    this.textures.push(new GLtexture(
	this.gl, RUG_TEXTURE));
    this.textures.push(new GLtexture(
	this.gl, HEAVEN_TEXTURE));
    this.textures.push(new GLtexture(
	this.gl, HELL_TEXTURE));
    this.textures.push(new GLtexture(
	this.gl, FLOOR_TEXTURE));
    this.textures.push(new GLtexture(
	this.gl, OPERA_TEXTURE));
    this.textures.push(new GLtexture(
	this.gl, BRICK_TEXTURE));
    this.textures.push(new GLtexture(
	this.gl, TILE_TEXTURE));
    this.textures.push(new GLtexture(
	this.gl, SKYBOX_TEXTURE_REAL));
}

GLcanvas.prototype.changeShaders = function(frag, vert) {
    this.initShaders(frag, vert);
    this.initTextures();
    this.initSkybox();
    this.bufferModels();
}
		     
GLcanvas.prototype.initShaders = function(frag, vert) {
    var fragmentShader = getShader(this.gl, frag);
    var vertexShader = getShader(this.gl, vert);
    
    this.shader = this.gl.createProgram();
    this.gl.attachShader(this.shader, vertexShader);
    this.gl.attachShader(this.shader, fragmentShader);
    this.gl.linkProgram(this.shader);

    if (!this.gl.getProgramParameter(
	this.shader, this.gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    this.gl.useProgram(this.shader);

    this.shader.vPosA = 
	this.gl.getAttribLocation(
	    this.shader, "vPosA");
    this.gl.enableVertexAttribArray(
	this.shader.vPosA);

    this.shader.vNormA = 
	this.gl.getAttribLocation(
	    this.shader, "vNormA");
    this.gl.enableVertexAttribArray(
	this.shader.vNormA);

    this.shader.vColA = 
	this.gl.getAttribLocation(this.shader, "vColA");
    this.gl.enableVertexAttribArray(this.shader.vColA);

    this.shader.textureA = 
	this.gl.getAttribLocation(this.shader, "textureA");
    this.gl.enableVertexAttribArray(this.shader.textureA);

    this.shader.textureNumA = 
	this.gl.getAttribLocation(this.shader, "textureNumA");
    this.gl.enableVertexAttribArray(this.shader.textureNumA);

    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "woodU"), WOOD_TEXTURE);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "rugU"), RUG_TEXTURE);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "skyRealU"), SKYBOX_TEXTURE_REAL);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "heavenU"), HEAVEN_TEXTURE);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "hellU"), HELL_TEXTURE);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "floorU"), FLOOR_TEXTURE);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "operaU"), OPERA_TEXTURE);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "brickU"), BRICK_TEXTURE);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "tileU"), TILE_TEXTURE);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "noU"), NO_TEXTURE);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "sky1U"), SKYBOX_TEXTURE_1);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "sky2U"), SKYBOX_TEXTURE_2);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "sky3U"), SKYBOX_TEXTURE_3);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "sky4U"), SKYBOX_TEXTURE_4);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "sky5U"), SKYBOX_TEXTURE_5);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "sky6U"), SKYBOX_TEXTURE_0);
    this.gl.uniform1i(this.gl.getUniformLocation(
	this.shader, "textTextureU"), TEXT_TEXTURE);

    // Perspecctive matrix
    this.shader.pMatU = 
	this.gl.getUniformLocation(
	    this.shader, "pMatU");
    // Model matrix
    this.shader.mMatU = 
	this.gl.getUniformLocation(
	    this.shader, "mMatU");
    // Viewing matrix
    this.shader.vMatU = 
	this.gl.getUniformLocation(
	    this.shader, "vMatU");
    // Model's normal matrix
    this.shader.nMatU = 
	this.gl.getUniformLocation(
	    this.shader, "nMatU");
    // Lighting matrix
    this.shader.lMatU = 
	this.gl.getUniformLocation(
	    this.shader, "lMatU");
    // Initial light's position
    this.shader.lightPosU = 
	this.gl.getUniformLocation(
	    this.shader, "lightPosU");

    theMatrix.setConstUniforms(this.gl, this.shader);
}
var theCanvas;
