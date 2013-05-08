/**
 * GLobject abstracts away buffers and arrays of data, 
 *  allowing us to work at a high level without 
 *  tripping over low-level implementation details.
 */
function GLobject() {

    this.data = [];
    this.buff = [];

    // Data to load into buffers
    this.data["norm"] = [];
    this.data["pos"] = [];
    this.data["col"] = [];
    this.data["index"] = [];
    this.data["tex"] =  [];

    this.textureNum = null;

    // Quads use an index position counter
    this.indexPos = 0;

    // Ensure any repeat initialization
    //  of this object's data will do it correctly
    this.normsInverted = false;
    this.hasFlatNorms = false;
}

/**
 * Pass 3 numbers into the object's internal arrays
 */
GLobject.prototype.addNorms = function(x,y,z) {     
    this.data["norm"].push(x);
    this.data["norm"].push(y);
    this.data["norm"].push(z); };
GLobject.prototype.addPos = function(x,y,z) {
    this.data["pos"].push(x);
    this.data["pos"].push(y);
    this.data["pos"].push(z); };
GLobject.prototype.addColors = function(x,y,z) {
    this.data["col"].push(x);
    this.data["col"].push(y);
    this.data["col"].push(z); };
GLobject.prototype.addTexture = function(x,y) {
    this.data["tex"].push(x);
    this.data["tex"].push(y); };
GLobject.prototype.addIndexes = function(x,y,z) {
    this.data["index"].push(x);
    this.data["index"].push(y);
    this.data["index"].push(z); };

/**
 * Or, pass a vec3 
 * (only with arrays that it makes sense for)
 */
GLobject.prototype.addNormVec = 
    function(vec) { this.data["norm"].push(vec[0]);
		    this.data["norm"].push(vec[1]);
		    this.data["norm"].push(vec[2]); };
GLobject.prototype.addPosVec = 
    function(vec) { this.data["pos"].push(vec[0]);
		    this.data["pos"].push(vec[1]);
		    this.data["pos"].push(vec[2]); };
GLobject.prototype.addColorVec = 
    function(vec) { this.data["col"].push(vec[0]);
		    this.data["col"].push(vec[1]);
		    this.data["col"].push(vec[2]); };

/**
 * Sometimes, we'll have to invert the norms 
 *  of objects
 */
GLobject.prototype.invertNorms = function() {
    this.normsInverted = true;
    for (var i = 0; i < this.data["norm"].length; ++i) {
	this.data["norm"][i] = -this.data["norm"][i];
    }
};

/**
 * Sometimes, we'll have to invert the norms 
 *  of objects
 */
GLobject.prototype.invertFlatNorms = function() {
    for (var i = 0; i < this.data["norm_"].length; ++i) {
	this.data["norm_"][i] = -this.data["norm_"][i];
    }
};

/** 
 *  A---C 
 *  |  /|    Two triangles: ABC and BDC
 *  |/  |     
 *  B---D
 */
GLobject.prototype.addQuadIndexes = function(a, c) {
    this.data["index"].push(a);
    this.data["index"].push(a+1);
    this.data["index"].push(c);
    this.data["index"].push(c+1);
    this.data["index"].push(c);
    this.data["index"].push(a+1);
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
    return this;
};

GLobject.prototype.initTextures = function(at, bt, ct, dt) { 
    this.addTexture(at[0], at[1]);
    this.addTexture(bt[0], bt[1]);
    this.addTexture(ct[0], ct[1]); 
    this.addTexture(dt[0], dt[1]);
};

/**
 *   Based upon the enumerated texture chosen,
 *   selects which lighting attributes this object
 *   will receive. 
 *
 *   These values are uniforms - the same for each vertice
*/
GLobject.prototype.setTexture = function(theTexture) { 

    this.textureNum = theTexture;
    
    // default values
    this.ambient_coeff = 0.1;
    this.diffuse_coeff = 0.7;
    this.specular_coeff = 0.0;
    this.specular_color = vec3.fromValues(0.8, 0.8, 0.8);

    switch(theTexture) {
    case HELL_TEXTURE:
	//vec3.set(this.specular_color, 0.7, 0.2, 0.2);
	this.specular_coeff = 0.0;
	this.ambient_coeff = 0.0;
	this.diffuse_coeff = 1.0;
	break;
    case FLOOR_TEXTURE:
	this.ambient_coeff = 0.2;
	this.diffuse_coeff = 0.4;
	break;
    case BRICK_TEXTURE:
	this.ambient_coeff = 0.1;
	this.diffuse_coeff = 0.2;
	
	break; 
    case TILE_TEXTURE:
	this.ambient_coeff = 0.1;
	this.diffuse_coeff = 0.3;
	break;
    case SKYBOX_TEXTURE_0:
    case SKYBOX_TEXTURE_1:
    case SKYBOX_TEXTURE_2:
    case SKYBOX_TEXTURE_3:
    case SKYBOX_TEXTURE_4:
    case SKYBOX_TEXTURE_5:
    case SKYBOX_TEXTURE_REAL:
    case TEXT_TEXTURE:
    case TEXT_TEXTURE2:
    case TEXT_TEXTURE3:
    case TEXT_TEXTURE4:
	// For certain textures, we want _no_ position-dependent lighting.
	this.ambient_coeff = 2.4;
	this.diffuse_coeff = 0.0;
	vec3.set(this.specular_color, 0.0, 0.0, 0.0);
//	this.specular_coeff = 1.0;
	break;
    case RUG_TEXTURE:
	this.ambient_coeff = 0.9;
	this.specular_coeff = 1.0;
	break;
    case FRAME_BUFF:
	this.ambient_coeff = 0.3;
	break;
    case WOOD_TEXTURE:
    case HEAVEN_TEXTURE: 
    case NO_TEXTURE:
	break;
    default:
	alert("Unsupported texture number %d in GLobject.js", theTexture);
	break;
    }
    return this;
};

/**
 *   Based upon the enumerated texture chosen,
 *   selects which lighting attributes this object
 *   will receive. 
 *
 *   These values are uniforms - the same for each vertice
*/
GLobject.prototype.setActive = function(theActive) { 
    this.active = theActive;
};

/**
 * Once the arrays are full, call to 
 *  buffer WebGL with their data
 */
GLobject.prototype.initBuffers = function(gl_) {

    if(!this.textureNum) { 
	this.setTexture(NO_TEXTURE);
    } else {
	// See if the texture has been created or not
	if(this.textureNum < TEXT_TEXTURE && !gl_.textureNums[this.textureNum]) {
	    gl_.textureNums[this.textureNum] = (new GLtexture(gl_, this.textureNum)).active;
	}
    }
//    this.initFlatNorms();

    this.bufferData(gl_, "norm", 3);
    this.bufferData(gl_, "pos", 3);
    this.bufferData(gl_, "col", 3);
    this.bufferData(gl_, "tex", 2);
    this.bufferElements(gl_, "index");
};

/**
   Buffer data fpr a single vertex attribute array.
*/
GLobject.prototype.bufferData = function(gl_, attr, size) {

    this.buff[attr] = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.buff[attr]);
    gl_.bufferData(gl_.ARRAY_BUFFER, 
		   new Float32Array(this.data[attr]),
		   gl_.STATIC_DRAW);
    this.buff[attr].itemSize = size;
    this.buff[attr].numItems = this.data[attr].length / size;
};

/**
   Buffer data fpr vertex elements.
*/
GLobject.prototype.bufferElements = function(gl_, elem) {

    this.buff["index"] = gl_.createBuffer();
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, this.buff["index"]);
    gl_.bufferData(gl_.ELEMENT_ARRAY_BUFFER, 
		   new Uint16Array(this.data["index"]),
		   gl_.STATIC_DRAW);
    this.buff["index"].itemSize = 1;
    this.buff["index"].numItems = this.data["index"].length;
};

GLobject.prototype.rotate = function(vec) {};

GLobject.prototype.scale = function(num) {
    for(var i = 0; i < this.data["pos"].length; ++i) {
	this.data["pos"][i] *= num; 
    }
    return this;
};

GLobject.prototype.translate = function(vec) {
    for(var i = 0; i < this.data["pos"].length; ++i) {
	this.data["pos"][i] += vec[i%3]; 
    }
    return this;
};

/**
   Link GL's pre-loaded attributes to the  program
   Then send the divide-and-conquer 'draw' signal to the GPU
*/
GLobject.prototype.linkAttribs = function(gl_) {

    var shader_ = gl_.active_shader;

    if(ball_shader_selectG  >= kNameG.length)
	ball_shader_selectG = 0;

    if(shader_.unis["u_kernel"])
	gl_.uniform1fv(shader_.unis["u_kernel"], 
		       kernelsG[kNameG[ball_shader_selectG]]);
    gl_.uniform2f(shader_.unis["u_textureSize"], 1024, 1024);
    //gl_.uniform1f(shader_.unis["ballHitu"], 0.0);

    gl_.uniform1f(shader_.unis["ambient_coeff_u"], this.ambient_coeff);
    gl_.uniform1f(shader_.unis["diffuse_coeff_u"], this.diffuse_coeff);

    // check to see if texture is used in shader
    if(shader_.unis["textureNumU"] && (this.textureNum !== NO_TEXTURE)) {

	// check to see if texture is a text texture
	if(this.textureNum >= FRAME_BUFF) {
	    gl_.uniform1f(shader_.unis["textureNumU"], this.active);
	} else if (gl_.textureNums[this.textureNum]) {
	    gl_.uniform1f(shader_.unis["textureNumU"], gl_.textureNums[this.textureNum]);
	} else { 
	    if(envDEBUG) { alert("error: texture not loaded."); }
	}
    }

    if(this.specular_color) { gl_.uniform3fv(shader_.unis["specular_color_u"], this.specular_color); }

    this.linkAttrib(gl_, "vNormA", "norm");
    this.linkAttrib(gl_, "vPosA", "pos");
    this.linkAttrib(gl_, "vColA", "col");
    this.linkAttrib(gl_, "textureA", "tex");
};

/**
 * Does type checking to ensure these attribs exist.
 * 1. If object contains it but shader does not, ignores it
 * 2. If shader contains it but object does not, turns attrib off
 * 3. If both have it, make sure attrib is enabled
 */
GLobject.prototype.linkAttrib = function(gl_, attr_name, buff_name) {

    var attribute = gl_.active_shader.attribs[attr_name];
    var buffer = this.buff[buff_name];
    if(attribute === undefined) return;                              // 1.
    if(!buffer || buffer.itemSize < 1) {                             // 2.
	if(gl_.getVertexAttrib(attribute, gl_.VERTEX_ATTRIB_ARRAY_ENABLED) === true)
	    gl_.disableVertexAttribArray(attribute); 
	return;
    }
    if(gl_.getVertexAttrib(attribute, gl_.VERTEX_ATTRIB_ARRAY_ENABLED) === false)
	gl_.enableVertexAttribArray(attribute);     // 3.
    gl_.bindBuffer(gl_.ARRAY_BUFFER, buffer);
    gl_.vertexAttribPointer(attribute, buffer.itemSize, gl_.FLOAT, false, 0, 0);
};

/**
   Send the divide-and-conquer 'draw' signal to the GPU
   Attributes must first be linked (as above).
*/
GLobject.prototype.drawElements = function(gl_) {
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, this.buff["index"]);
    gl_.drawElements(gl_.TRIANGLES, 
        this.buff["index"].numItems, gl_.UNSIGNED_SHORT, 0);
};

/**
 * Point to, and draw, the buffered triangles
 */
GLobject.prototype.draw = function(gl_) {

    var shader_;
    if(this.textureNum === NO_TEXTURE) {
	shader_ = gl_.shader_color;
    } else if(this.textureNum === HELL_TEXTURE) {
	shader_ = gl_.shader_ball;
    } else {
	shader_ = gl_.shader;
    }
    gl_.active_shader = shader_;
    if(gl_.getParameter(gl_.CURRENT_PROGRAM) !== shader_) {
	gl_.useProgram(shader_);
    }
    theMatrix.setViewUniforms(gl_, shader_);
    theMatrix.setVertexUniforms(gl_, shader_);
    this.linkAttribs(gl_);
    this.drawElements(gl_);
};

var FLATNORMS = false;
