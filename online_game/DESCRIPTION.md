###[Back to README](README.md)

##Following is a detailed description of each file in the project.

###demo.html
 The html file that everything starts out of.  This file contains all 
of the html elements pertinant to our webpage as well as the code
that implements the vertex and fragment shaders.  In addition, 
some important code with regard to texutres lies in this file.

###[GLcanvas.js](GLcanvas.js)
**Corresponds to HTML 'glcanvas' object**
 
Contains the code that intializes much of the environment.  Shaders,
	 textures, the skybox, and GL are all intialized here. -- This file 
	 is the "start" of all of the javascript files in the start() function. -- 
	 In addition this function takes in variables from the html code to 
	 choose which objects to draw.  Finally this file contains the 
	 draw scene function which is responsible for rendering the scene
	 each frame.

###[GLmatrix.js](GLmatrix.js)
Composes the matrix class we use for our modelview, camera, and view
	 matrices.  Here we have functions such as rotate and move to handle
	 respective user movements with the matricies.
	 **This allows us to only load new matrixes into the shaders if they
 have changed since their last load.**

###[GLobject.js](GLobject.js)
Holds the object class that we use when creating each respective 
 object (ex cylinder, sphere, etc...).  Here we have general functions
 such as addNormals or addPos that can be effectively utilized by each 
 function.  This class avoids a lot of useless code replication.

###[functions.js](functions.js)
Contains a wide variety of utility functions used within the project.
 Also contains function prototypes that are used by a variety of objects.

###webgl-utils and gl-matrix
Utility functions downloaded from the internet.

###Cylinder.js, Disk.js,  Quad.js, Sphere.js, Torus.js
Uses composition as inheritance to interface away underlying GLobject.
 
###Light.js, Maze.js, MazePiece.js, SixSidedPrism.js, Skybox.js, Stool.js, StoolPyramid.js
Heirarchically uses classes defined in these files, and above files,
	          to create and render increasingly complex objects.

For example: GLobject -> Torus -> Stool -> StoolPyramid
