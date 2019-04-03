###[Back to README](README.md)

##How to load a texture into WebGL
TODO instead, just link to a commit

####Find or create an image with these properties:
- less than 1.5 Mb in size 
- All sides have the same dimension, which is a power of 2

####In GLtexture.js:
- Create a const called xxx_TEXTURE paralleling existing ones, underneath all the others. It's important that the values for all the existing ones remain the same.
- Create an `else if` statement right above the final `else` using the const
- Set the content to one of these two strings:
   `} else if(this.index == xxx_TEXTURE) { this.img.src = "data:image/jpeg;base64,";` or
   `} else if(this.index == xxx_TEXTURE) { this.img.src = "data:image/png;base64,";`

####Convert the image into base64 encoding.
- At [this site](http://www.base64-image.de/)
- Upload the image
- Copy the raw data of the string
- Paste after the final comma within the string

####In demo.html:
- Add the uniform sampler variable for your specified texture.
- Navigate to the fragment shader - searching doc for `fs` is fast
- After the final `else` statement, add another `else if` - should be the highest number mentioned
- Feel free to mess with brightness or lighting values as some of the others do

####In [GLcanvas.js](GLcanvas.js)
- Add lines to find location for your new uniform variable.
- Add line to declare XXX_TEXTURE constant value (must be consistent with demo.html).
- Add line to init your texture.

Done! This gets passed to the buffer and set in GLobject.js. `NO_TEXTURE` is the default value loaded if none is set.
