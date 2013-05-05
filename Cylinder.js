var rotateY;

function Cylinder(base_radius, top_radius, height, slices, stacks) { 
    this.o = new GLobject();

    this.base_radius = base_radius;
    this.top_radius = top_radius;
    this.height = height;
    this.slices = slices;
    this.stacks = stacks;

    var radius_change = top_radius - base_radius;
    var radius_step_size = radius_change/stacks;
    var radius = base_radius;

    var theta = Math.atan((base_radius-top_radius)/height);
    var z_norm = Math.sin(theta);
    var xy =  Math.cos(theta);

    for (var i = 0; i <= stacks; i++) {
	// From 0 to height
	var z = (i/stacks)*height;
	if(i!=0) radius += radius_step_size;

	for (var j = 0; j <= slices; j++) {
	    // From 0 to 2 pi
	    var phi = j / (slices/2) * Math.PI;
	    // x = r sin theta cos phi
	    var x = 1 * Math.cos(phi);
	    var y = 1 * Math.sin(phi);

	    var x_norm = x*xy;
	    var y_norm = y*xy
	    // z norm = sin theta

	    this.o.addNorms(x_norm, y_norm, z_norm);
	    this.o.addPos(radius * x, radius * y, z);
	    this.o.addColors(colorVec[2],
			     colorVec[1],
			     colorVec[0]);
	}
    }

    // We have the vertices now - stitch them 
    //  into triangles
    // A  C 
    //        Two triangles: ABC and BDC
    // B  D   Longitude lines run through AB and  CD
    //        Array indices of C and D are A / B + 1

    for (var latitude = 0; latitude < this.stacks; latitude++) {
	for (var longitude = 0; longitude < this.slices; longitude++) {
	    var A = (latitude * (this.slices + 1)) + longitude;
	    var B = A + this.slices + 1;
	    var C = A + 1;
	    var D = B + 1;
	    this.o.addIndexes(A, B, C);
	    this.o.addIndexes(B, D, C);
	}
    }
}

Cylinder.prototype.invertNorms = _oInvertNorms;

Cylinder.prototype.wrapText = function() {
    return;
    this.o.setTexture(TEXT_TEXTURE);

    var xPos, yPos;
    for (var latitude = 0; i <= this.stacks; i++) {
	yPos = i / (this.stacks - 1);
	
	for (var j = 0; j <= this.slices; j++) {
	xPos = 10 * (j / (this.slices)) % 1;
	    this.o.addTexture(xPos, yPos);
	}
    }
};

Cylinder.prototype.drawScrew = function() {

    var radius_change = this.top_radius - this.base_radius;
    var radius_step_size = radius_change/this.stacks;
    var radius = this.base_radius;

    var theta = Math.atan(Math.abs(this.top_radius-this.base_radius)/this.height);
    var z_norm = Math.sin(theta);
    var xy =  Math.cos(theta);

    var radius = this.base_radius;

    var index = 0;

    var minAngle = 0;
    var maxAngle = 3 / (this.slices/2) * Math.PI;

    for (var i = 1; i <= this.stacks - 4; i++) {
	// From 0 to height
	var z = (i/this.stacks)*this.height;
	if(i!=0) radius += radius_step_size;

	for (var j = 0; j <= this.slices; j++) {

	    // From 0 to 2 pi
	    var phi = j / (this.slices/2) * Math.PI;
	    // x = r sin theta cos phi

	    if(minAngle < phi && phi < maxAngle) {
		const slicesPlus = this.slices + 1;
	    var x = 1 * Math.cos(phi);
	    var y = 1 * Math.sin(phi);
		this.o.data["pos"][index] /= 0.7;
		this.o.data["pos"][index+1] /= 0.7;
		this.o.data["pos"][index+(3*slicesPlus)] *= 0.7;
		this.o.data["pos"][index+1+(3*slicesPlus)] *= 0.7;
		this.o.data["pos"][index-(3*slicesPlus)] *= 0.7;
		this.o.data["pos"][index+1-(3*slicesPlus)] *= 0.7;
		this.o.data["col"][index] = 1.0;
		this.o.data["col"][index+1] = 1.0;
		this.o.data["col"][index+2] = 1.0;
	    }

	    index += 3;
	}
	minAngle += 1 / this.slices * Math.PI * 2;
	maxAngle += 1 / this.slices * Math.PI * 2;
	minAngle %= Math.PI * 2;
	maxAngle %= Math.PI * 2;
    }

};

Cylinder.prototype.drawBlackStreak = function() {

    var radius_change = this.top_radius - this.base_radius;
    var radius_step_size = radius_change/this.stacks;
    var radius = this.base_radius;

    var theta = Math.atan(Math.abs(this.top_radius-this.base_radius)/this.height);
    var z_norm = Math.sin(theta);
    var xy =  Math.cos(theta);

    var radius = this.base_radius;

    var index = 0;

    var minAngle = 0;
    var maxAngle = 3 / (this.slices/2) * Math.PI;

    for (var i = 0; i <= this.stacks - 4; i++) {
	// From 0 to height
	var z = (i/this.stacks)*this.height;
	if(i!=0) radius += radius_step_size;

	for (var j = 0; j <= this.slices; j++) {

	    // From 0 to 2 pi
	    var phi = j / (this.slices/2) * Math.PI;
	    // x = r sin theta cos phi

	    if(minAngle < phi && phi < maxAngle) {
		this.o.data["col"][index] = 0.0;
		this.o.data["col"][index+1] = 0.0;
		this.o.data["col"][index+2] = 0.0;
		this.o.data["col"][index+(3*this.slices)] = 0.0;
		this.o.data["col"][index+1+(3*this.slices)] = 0.0;
		this.o.data["col"][index+2+(3*this.slices)] = 0.0;
	    }

	    index += 3;
	}
	minAngle += 1 / this.slices * Math.PI * 2;
	maxAngle += 1 / this.slices * Math.PI * 2;
	minAngle %= Math.PI * 2; 
	maxAngle %= Math.PI * 2;
    }
}    

Cylinder.prototype.initBuffers = _oInitBuffers;
Cylinder.prototype.translate = _oTranslate;
Cylinder.prototype.draw = _oDraw;
