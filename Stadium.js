function Stadium() {  
    //f b r l
    //meaning the order this data is pushed in is front, back, left, right wall.
    this.pieces = [];
    this.width = 5;
    this.height = 7;
    this.size = 20;
    this.balls = [];

    //# of maze pieces per side of the square floor
    //must be divisble by 5280
    var piecesPerSide = 24;
    var pieceLength = 5280/24;
    this.size = pieceLength;
    this.width = piecesPerSide;

    if(5280%piecesPerSide != 0)
	alert("Not a proper selection of pieces per side");

    //initializes the field...floor and walls
    this.Field();
    this.InitBalls();
}

Stadium.prototype.initBuffers = function(gl_) {
    for(var i=0; i < this.pieces.length; ++i){
	this.pieces[i].initBuffers(gl_);
    }

    for(var i=0; i < this.balls.length; ++i){
	this.balls[i].initBuffers(gl_);
    }
}

Stadium.prototype.InitBalls = function(){
    this.balls.push(new Ball([100,-100]));
}

var sbX_;
var sh_;
var sbZ_;
var sbW_;

Stadium.prototype.Field = function(){
    sbX_ = this.size/2 + 14.9; // back X coordinates
    sh_ = this.size/2;    // height of wall                                      
    sbZ_ = this.size/2 -15.1;  // back Z coordinate                                   
    sbW_ = 30.0;  // width of back wall

    //stamp out square floor with proper variables
    for(var i=0;i<this.width; i++){
	for(var j=0;j<this.width; j++){
	    var wall = 0;
	    if(i==0)
		wall |= BACK;
	    if(j==0)
		wall |= LEFT;
	    if(i==(this.width-1))
		wall |= FRONT;
	    if(j==(this.width-1))
		wall |= RIGHT;

	    this.Piece(wall, BRICK_TEXTURE).atCoord(j,i);	    
	}
    }
}

Stadium.prototype.Piece = function(a,b) {
    var newPiece = new StadiumPiece(this.size, a,b);
    this.pieces.push(newPiece);
    return newPiece;
}

Stadium.prototype.draw = function(gl_,buffer_) {
    for(var i = 0; i<this.balls.length; i++){
	this.balls[i].draw(gl_, buffer_);
    }

    for(var i = 0; i<this.pieces.length; i++){
	this.pieces[i].draw(gl_, buffer_);
    }
}

/**
 *  Remember: (0,0) is top left, (20 * Width, -20 * Height) is
 *  bottom right, in the xz plane
 * 
 *  This function returns false if position is illegal
 */
Stadium.prototype.checkPosition = function() {
    var pieceX, pieceZ, curPiece, newPiece;
    var thePos = vec4.fromValues(0,0,0,1);
    var newPos = vec4.fromValues(0,0,0,1);
    var curPos = vec4.fromValues(0,0,0,1);

    vec4.transformMat4(newPos, thePos, theMatrix.vMatrixNew);
    vec4.transformMat4(newPos, newPos, theMatrix.vMatrix);
    vec4.transformMat4(curPos, curPos, theMatrix.vMatrix);

    pieceX = Math.round(curPos[0] / this.size);
    pieceZ = Math.round(curPos[2] /-this.size);
    curPiece = (this.width * pieceZ) + pieceX;

    pieceX = Math.round(newPos[0] / this.size);
    pieceZ = Math.round(newPos[2] /-this.size);
    newPiece = (this.width * pieceZ) + pieceX;

    var piecePosX = newPos[0] % this.size;
    var piecePosZ = newPos[2] % this.size;

    if(1==1) {
	var posStats = document.getElementById("positionCheckStats");
	posStats.style.display = "inline-block";
	posStats.innerHTML = "old position: " + 
	    parseFloat(curPos[0]).toFixed(2) + "," + 
	    parseFloat(curPos[1]).toFixed(2) + "," +  
	    parseFloat(curPos[2]).toFixed(2) +
	    "<br/>new position: " +
	    parseFloat(newPos[0]).toFixed(2) + "," + 
	    parseFloat(newPos[1]).toFixed(2) + "," +  
	    parseFloat(newPos[2]).toFixed(2);

	posStats.innerHTML += "<br/> Stadium Piece: from " + 
	    curPiece +
	    " to " + newPiece;
	if(piecePosX > 10 && piecePosX < 12) posStats.innerHTML += 
	"<br/> Getting close to right wall..";
	else if(piecePosX > 8 && piecePosX < 10) posStats.innerHTML += 
	"<br/> Getting close to left wall..";
	if(piecePosZ < -10 && piecePosZ > -12) posStats.innerHTML += 
	"<br/> Getting close to top wall..";
	else if(piecePosZ < -8 && piecePosZ > -10) posStats.innerHTML += 
	"<br/> Getting close to bottom wall..";
	}

    if(newPiece < 0) { return false; }
    
    var ballCollision = false;
    //see if we collide with a ball
    for(var i = 0; i<this.balls.length; i++){
	if(!this.balls[i].detectCollision(curPos, newPos)){
	    ballCollision = true;
	    i = this.balls.length;
	}
    }
    
    if((curPiece >= 0) && 
       (!this.pieces[curPiece].positionLegal(newPos)) ||
       (!this.pieces[newPiece].positionLegal(newPos)) ||
       ballCollision
      ) {
	mat4.identity(theMatrix.vMatrixNew, theMatrix.vMatrixNew);
    }	
    return true;
}
