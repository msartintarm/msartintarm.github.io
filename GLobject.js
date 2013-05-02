/**
 * GLobject abstracts away buffers and arrays of data, 
 *  allowing us to work at a high level without 
 *  tripping over low-level implementation details.
 */
function GLobject() {

    // Data to load into buffers
    this.normData = [];
    this.posData = [];
    this.colData = [];
    this.indexData = [];
    this.textureData =  [];
    this.textureNum = [];

    // Quads use an index position counter
    this.indexPos = 0;

    // Position / scale / rotation data for this object
    // X-Y-Z position to translate
    this.position = [0,0,0];
    this.position = [0,0,0];
    // X-Y-Z coords to rotate
    this.rotation = [0,0,0];
    this.scale = 1;

    // Ensure any repeat initialization
    //  of this object's data will do it correctly
    this.normsInverted = false;
    this.hasFlatNorms = false;
}

/**
 * Pass 3 numbers into the object's internal arrays
 */
GLobject.prototype.addNorms = function(x,y,z) {     
    this.normData.push(x);
    this.normData.push(y);
    this.normData.push(z); };
GLobject.prototype.addPos = function(x,y,z) {
    this.posData.push(x);
    this.posData.push(y);
    this.posData.push(z); };
GLobject.prototype.addColors = function(x,y,z) {
    this.colData.push(x);
    this.colData.push(y);
    this.colData.push(z); };
GLobject.prototype.addTexture = function(x,y) {
    this.textureData.push(x);
    this.textureData.push(y); };
GLobject.prototype.addIndexes = function(x,y,z) {
    this.indexData.push(x);
    this.indexData.push(y);
    this.indexData.push(z); };

/**
 * Or, pass a vec3 
 * (only with arrays that it makes sense for)
 */
GLobject.prototype.addNormVec = 
    function(vec) { this.normData.push(vec[0]);
		    this.normData.push(vec[1]);
		    this.normData.push(vec[2]); };
GLobject.prototype.addPosVec = 
    function(vec) { this.posData.push(vec[0]);
		    this.posData.push(vec[1]);
		    this.posData.push(vec[2]); };
GLobject.prototype.addColorVec = 
    function(vec) { this.colData.push(vec[0]);
		    this.colData.push(vec[1]);
		    this.colData.push(vec[2]); };

/**
 * Sometimes, we'll have to invert the norms 
 *  of objects
 */
GLobject.prototype.invertNorms = function() {
    this.normsInverted = true;
    for (var i = 0; i < this.normData.length; ++i) {
	this.normData[i] = -this.normData[i];
    }
};

/**
 * Sometimes, we'll have to invert the norms 
 *  of objects
 */
GLobject.prototype.invertFlatNorms = function() {
    for (var i = 0; i < this.normData_.length; ++i) {
	this.normData_[i] = -this.normData_[i];
    }
};

/** 
 *  A---C 
 *  |  /|    Two triangles: ABC and BDC
 *  |/  |     
 *  B---D
 */
GLobject.prototype.addQuadIndexes = function(a, c) {
    this.indexData.push(a);
    this.indexData.push(a+1);
    this.indexData.push(c);
    this.indexData.push(c+1);
    this.indexData.push(c);
    this.indexData.push(a+1);
};

/**
   Buffers a quadrilateral.
*/
GLobject.prototype.Quad = function(a, b, c, d) { 
    this.addPosVec(a);
    this.addPosVec(b);   
    this.addPosVec(c);   
    this.addPosVec(d);

    var temp1 = vec3.create();
    var temp2 = vec3.create();
    var normV = vec3.create();

    vec3.cross(normV, vec3.sub(temp1,b,a), vec3.sub(temp2,c,a));

    for (var i = 0; i < 4; ++i) {
	this.addNormVec(normV);
	this.addColors(0.3, 0.5, 0.7);
    }
    this.addQuadIndexes(this.indexPos,
			this.indexPos + 2);
    this.indexPos += 4;
};

GLobject.prototype.initTextures = function(at, bt, ct, dt) { 
    this.addTexture(at[0], at[1]);
    this.addTexture(bt[0], bt[1]);
    this.addTexture(ct[0], ct[1]); 
    this.addTexture(dt[0], dt[1]);
};

GLobject.prototype.setTexture = function(theTexture) { 
    for(var i = 0; i < this.normData.length / 3; ++i) {
	this.textureNum[i] = theTexture;
    }

    this.ambient_coeff = 0.1;
    this.diffuse_coeff = 0.7;
    this.specular_coeff = 0.0;
    this.specular_color = vec3.fromValues(0.8, 0.8, 0.8);

    switch(theTexture) {
	case 0: case 1: break;
    case 2:
	vec3.set(this.specular_color, 0.7, 0.2, 0.2);
	this.specular_coeff = 1.0;
	break;
    case 3:
	this.ambient_coeff = 0.2;
	this.diffuse_coeff = 0.4;
	break;
    case 5:
	this.ambient_coeff = 0.1;
	this.diffuse_coeff = 0.4;
	break; 
    case 6:
	this.ambient_coeff = 0.25;
	this.diffuse_coeff = 0.4;
	break;
    case 7:
	break;
    case 8: case 9: case 10: case 11: 
    case 12: case 13: case 15: case 17: 
    case 18: case 19: case 20: case 21: 
    case 22: case 23: case 24: case 25:
	this.ambient_coeff = 0.0;
	this.diffuse_coeff = 0.0;
	vec3.set(this.specular_color, 0.0, 0.0, 0.0);
	this.specular_coeff = 1.0;
	break;
    case 14:
	this.ambient_coeff = 0.9;
	this.specular_coeff = 1.0;
	break;
    case 16:
	this.ambient_coeff = 0.3;
	break;
    default:
	alert("Unsupported texture number in GLobject.js");
	break;
    }
    return this;
};

/**
 * Once the arrays are full, call to 
 *  buffer WebGL with their data
 */
GLobject.prototype.initBuffers = function(gl_) {

    var i, max;
    if(this.textureData.length < 1) {
	
	for(i = 0, max = this.normData.length / 3; i < max; ++i) {
	    this.textureData.push(0);
	    this.textureData.push(0);
	}
    }

    if(this.textureNum.length >= 1) {
	gl_.textures[this.textureNum[0]] = gl_;
    } else {
	this.setTexture(NO_TEXTURE);
    }

    this.initFlatNorms();

    this.normBuff = gl_.createBuffer();
    this.posBuff = gl_.createBuffer();
    this.colBuff = gl_.createBuffer();
    this.indexBuff = gl_.createBuffer();
    this.textureBuff = gl_.createBuffer();
    this.textureNumBuff = gl_.createBuffer();

    // If we have flat norms, use them
    if(FLATNORMS === true) {
	this.bufferData(gl_, this.normBuff, this.normData_, 3);
	this.bufferData(gl_, this.posBuff, this.posData_, 3);
	this.bufferData(gl_, this.colBuff, this.colData_, 3);
	this.bufferData(gl_, this.textureBuff, this.textureData_, 2);
	this.bufferData(gl_, this.textureNumBuff, this.textureNum_, 1);
	this.bufferElements(gl_, this.indexBuff, this.indexData_);
    } else {
	this.bufferData(gl_, this.normBuff, this.normData, 3);
	this.bufferData(gl_, this.posBuff, this.posData, 3);
	this.bufferData(gl_, this.colBuff, this.colData, 3);
	this.bufferData(gl_, this.textureBuff, this.textureData, 2);
	this.bufferData(gl_, this.textureNumBuff, this.textureNum, 1);
	this.bufferElements(gl_, this.indexBuff, this.indexData);
    }
};

/**
   Buffer data fpr a single vertex attribute array.
*/
GLobject.prototype.bufferData = function(gl_, theBuff, theData, theSize) {

    gl_.bindBuffer(gl_.ARRAY_BUFFER, theBuff);
    gl_.bufferData(gl_.ARRAY_BUFFER, 
		   new Float32Array(theData),
		   gl_.STATIC_DRAW);
    theBuff.itemSize = theSize; 
    theBuff.numItems = theData.length / theSize;
};

/**
   Buffer data fpr vertex elements.
*/
GLobject.prototype.bufferElements = function(gl_, theBuff, theData, theSize) {

    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, theBuff);
    gl_.bufferData(gl_.ELEMENT_ARRAY_BUFFER, 
		   new Uint16Array(theData),
		   gl_.STATIC_DRAW);
    theBuff.itemSize = 1;
    theBuff.numItems = theData.length;
};

GLobject.prototype.rotate = function(vec) {
    this.rotation[2] += vec[2]; 
    this.rotation[1] += vec[1]; 
    this.rotation[0] += vec[0]; 
};

GLobject.prototype.scale = function(num) {
    for(var i = 0; i < this.posData.length; ++i) {
	this.posData[i] *= num; 
    }
    return this;
};

GLobject.prototype.translate = function(vec) {
    for(var i = 0; i < this.posData.length; i += 3) {
	this.posData[i] += vec[0]; 
	this.posData[i+1] += vec[1]; 
	this.posData[i+2] += vec[2]; 
    }
    return this;
};

/**
   Link GL's pre-loaded attributes to the shader program
   Then send the divide-and-conquer 'draw' signal to the GPU
*/
GLobject.prototype.linkAttribs = function(gl_, shader_) {
    
    gl_.uniform1f(shader_.ambient_coeff, this.ambient_coeff);
    gl_.uniform1f(shader_.diffuse_coeff, this.diffuse_coeff);
//    gl_.uniform1f(shader_.specular_coeff, this.specular_coeff);
    gl_.uniform3fv(shader_.specular_color, this.specular_color);

    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.normBuff);
    gl_.vertexAttribPointer(shader_.vNormA, this.normBuff.itemSize, gl_.FLOAT, false, 0, 0);
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.posBuff);
    gl_.vertexAttribPointer(shader_.vPosA, this.posBuff.itemSize, gl_.FLOAT, false, 0, 0);
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.colBuff);
    gl_.vertexAttribPointer(shader_.vColA, this.colBuff.itemSize, gl_.FLOAT, false, 0, 0);
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.textureBuff);
    gl_.vertexAttribPointer(shader_.textureA, this.textureBuff.itemSize, gl_.FLOAT, false, 0, 0);
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.textureNumBuff);
    gl_.vertexAttribPointer(shader_.textureNumA, this.textureNumBuff.itemSize, gl_.FLOAT, false, 0, 0);
};

/**
   Send the divide-and-conquer 'draw' signal to the GPU
   Attributes must first be linked (as above).
*/
GLobject.prototype.drawElements = function(gl_) {
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, this.indexBuff);
    gl_.drawElements(gl_.TRIANGLES, 
        this.indexBuff.numItems, gl_.UNSIGNED_SHORT, 0);
};

/**
 * Point to, and draw, the buffered triangles
 */
GLobject.prototype.draw = function(gl_) {

    var shader_ = (this.textureNum[0] === NO_TEXTURE) ? gl_.shader: gl_.shader;
    if(gl_.getParameter(gl_.CURRENT_PROGRAM) !== shader_) {
	gl_.useProgram(shader_);
    }
    theMatrix.setViewUniforms(gl_, shader_);
    theMatrix.setVertexUniforms(gl_, shader_);
    this.linkAttribs(gl_, shader_);
    this.drawElements(gl_);
};

var FLATNORMS = false;

/**
   Each quad is made up of four triangles, and hence, 
   the norms -can- be calculated solely through their
   positions. 

   All position data must be stable before this point.
*/
GLobject.prototype.initFlatNorms = function() {
    
    if(FLATNORMS === false || this.hasFlatNorms === true) return;
    this.hasFlatNorms = true;

    var a, b, c, d;
    a = vec3.create();
    b = vec3.create();
    c = vec3.create();
    d = vec3.create();

    this.indexData_ = [];
    this.normData_ = [];
    this.colData_ = [];
    this.posData_ = []; 
    this.textureData_ = [];
    this.textureNum_ = [];
    // We'll go over one triangle (3 indexes, 3 * data_size elements for each new buffer)
    // This will mean the new buffers will have 3/2 as many elements
    var i = 0;
    while(i < this.indexData.length) {

	// Load up every element
	this.indexData_.push(i);
	ind = this.indexData[i];
	this.colData_.push( this.colData[ind * 3] );
	this.colData_.push( this.colData[ind * 3 + 1] );
	this.colData_.push( this.colData[ind * 3 + 2] );
	this.posData_.push( this.posData[ind * 3] );
	this.posData_.push( this.posData[ind * 3 + 1] );
	this.posData_.push( this.posData[ind * 3 + 2] );
	this.textureData_.push( this.textureData[ind * 2] );
	this.textureData_.push( this.textureData[ind * 2 + 1] );
	this.textureNum_.push( this.textureNum[ind] );
	vec3.set(a, this.posData[ind * 3], 
		    this.posData[ind * 3 + 1], 
		    this.posData[ind * 3 + 2]); 
	i++;
	// 3 times. Only the vector that's set changes.
	this.indexData_.push(i);
	ind = this.indexData[i];
	this.colData_.push( this.colData[ind * 3] );
	this.colData_.push( this.colData[ind * 3 + 1] );
	this.colData_.push( this.colData[ind * 3 + 2] );
	this.posData_.push( this.posData[ind * 3] );
	this.posData_.push( this.posData[ind * 3 + 1] );
	this.posData_.push( this.posData[ind * 3 + 2] );
	this.textureData_.push( this.textureData[ind * 2] );
	this.textureData_.push( this.textureData[ind * 2 + 1] );
	this.textureNum_.push( this.textureNum[ind] );
	vec3.set(b, this.posData[ind * 3], 
		    this.posData[ind * 3 + 1], 
		    this.posData[ind * 3 + 2]); 
	i++;
	// Last time.
	this.indexData_.push(i);
	ind = this.indexData[i];
	this.colData_.push( this.colData[ind * 3] );
	this.colData_.push( this.colData[ind * 3 + 1] );
	this.colData_.push( this.colData[ind * 3 + 2] );
	this.posData_.push( this.posData[ind * 3] );
	this.posData_.push( this.posData[ind * 3 + 1] );
	this.posData_.push( this.posData[ind * 3 + 2] );
	this.textureData_.push( this.textureData[ind * 2] );
	this.textureData_.push( this.textureData[ind * 2 + 1] );
	this.textureNum_.push( this.textureNum[ind] );
	vec3.set(c, this.posData[ind * 3], 
		    this.posData[ind * 3 + 1], 
		    this.posData[ind * 3 + 2]); 
	i++;
	// Calc norms for these 3 triangles.
	vec3.sub(b, b, a);
	vec3.sub(c, c, a);
	vec3.cross(c, c, b);
	vec3.normalize(c, c);

	this.normData_.push(c[0]);
	this.normData_.push(c[1]);
	this.normData_.push(c[2]);
	this.normData_.push(c[0]);
	this.normData_.push(c[1]);
	this.normData_.push(c[2]);
	this.normData_.push(c[0]);
	this.normData_.push(c[1]);
	this.normData_.push(c[2]);
    }

    if(this.normsInverted) { this.invertFlatNorms(); }

};
