var colorVec;

function Disk(inner_radius, outer_radius, slices, loops) {

    this.o = new GLobject();
 
    var radius_step_size = (outer_radius-inner_radius)/loops;
    var radius = inner_radius;

    for (var i = 0; i <= loops; i++) {
	if(i!=0) radius += radius_step_size;
	for (var j = 0; j <= slices; j++) {
	    // From 0 to 2 pi
	    var phi = j / (slices/2) * Math.PI;
	    // x = r sin theta cos phi
	    var x = 1 * Math.cos(phi);
	    var y = 1 * Math.sin(phi);
	    var z = 0;

	    this.o.addNorms(0, 0, 1);
	    this.o.addPos(radius * x, radius * y, z);
	    this.o.addColors(colorVec[0],
			     colorVec[1],
			     colorVec[2]);
	}
    }

    // We have the vertices now - stitch them 
    //  into triangles
    // A  C 
    //        Two triangles: ABC and BDC
    // B  D   Longitude lines run through AB and  CD
    //        Array indices of C and D are A / B + 1

    for (var i = 0; i < loops; ++i) {
	for (var j = 0; j < slices; ++j) {
	    var A = (i * (slices + 1)) + j;
	    var C = A + slices + 1;
	    this.o.addQuadIndexes(A, C);
	}
    }
}

Disk.prototype.initBuffers = _oInitBuffers;
Disk.prototype.invertNorms = _oInvertNorms;
Disk.prototype.rotatePos = _oRotatePos;
Disk.prototype.rotateNeg = _oRotateNeg;
Disk.prototype.scale = _oScale;
Disk.prototype.flip = _oFlip;
Disk.prototype.setShader = _oSetShader;
Disk.prototype.translate = _oTranslate;
Disk.prototype.draw = _oDraw;
