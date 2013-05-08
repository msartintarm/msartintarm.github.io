/**
   A four-screen Jumbotron. Modeled from
   http://upload.wikimedia.org/wikipedia/commons/e/ee/TD_Banknorth_Garden_Jumbotron.jpg

   Distances measured in pixels
*/
function Jumbotron() { 

    // ThickCyl: inner_radius, width, height, slices, stacks
    // 3 Thick Cyls in the Jumbotron

    var radiusA = 773;
    var radiusB = 758;

    var widthA = 34;
    var widthB = 37;
    
    var heightA = 114;
    var heightB = 171;

    var distB = heightA + 106;

    var slices = 30;
    var stacks = 30;

    this.thickCylA = new ThickCyl(radiusA, widthA, heightA, slices, stacks);
    this.thickCylB = new ThickCyl(radiusB, widthB, heightB, slices, stacks)
	.translate([0, 0, distB]);

    // RectangularPrism: a, b, c, d, width
    // The Jumbotrons's screen's corners are symmetrical to the center of the plane,
    // and near the second and third ThickCyl.
    var angleA = Math.PI / 32;
    var angleB = (Math.PI / 2) - angleA;
    var angleC = Math.PI / 64;
    var angleD = (Math.PI / 2) - angleC;
    var distScreen = -distB - heightB - 110;
    var heightScreen = 600; // TODO: actually measure (MST)

    var widthScreen = 50;   // TODO: actually measure (MST)
    
    // sin(angleA) = cos(angleB)
    // cos(angleB) = sin(angleA)
    var a = vec3.fromValues(Math.cos(angleB) * radiusA, 
			    distScreen, 
			    Math.sin(angleB) * radiusA);
    var d = vec3.fromValues(a[2], a[1], a[0]);
    
    var b = vec3.fromValues(Math.cos(angleD) * (radiusA - 140),
			    distScreen - heightScreen,
			    Math.sin(angleD) * (radiusA - 140));
    var c = vec3.fromValues(b[2], b[1], b[0]);
    
    this.frame = new GLframe(FRAME_BUFF);

    this.jumboScreen = new SixSidedPrism.rectangle(a, b, c, d, widthScreen);

    this.jumboScreen.setSixTextures(FRAME_BUFF, FRAME_BUFF, FRAME_BUFF, 
				    FRAME_BUFF, FRAME_BUFF, FRAME_BUFF);
    return this;
}

Jumbotron.prototype.translate = function(vec) {
    this.thickCylA.translate(vec);
    this.thickCylB.translate(vec);
    this.jumboScreen.translate(vec);
    return this;
}

Jumbotron.prototype.scale = function(val) {
    this.thickCylA.scale(val);
    this.thickCylB.scale(val);
    this.jumboScreen.scale(val);
    return this;
}

Jumbotron.prototype.initBuffers = function(gl_) {

    for (object in this) {
	if (object.scale) object.scale(gl_);
	if (object.init) object.init(gl_);
	else if (object.initBuffers) object.initBuffers(gl_);
    }
  /*  this.frame.init(gl_);
    this.thickCylA.initBuffers(gl_);
    this.thickCylB.initBuffers(gl_);
    this.jumboScreen.initBuffers(gl_);
*/}

Jumbotron.prototype.setShader = function(shader) {
    this.frame.setShader(shader);
    this.thickCylA.setShader(shader);
    this.thickCylB.setShader(shader);
    this.jumboScreen.setShader(shader);
}

Jumbotron.prototype.draw = function(gl_) {

    this.frame.drawScene(gl_);
    theMatrix.push();
    theMatrix.rotate(Math.PI / 2, [1, 0, 0]);
    this.thickCylA.draw(gl_);
    this.thickCylB.draw(gl_);
    theMatrix.pop();
    for(var i = 0; i < 4; ++i) {
	this.jumboScreen.draw(gl_);
	theMatrix.rotate(Math.PI / 2, [0, 1, 0]);
    }
}
