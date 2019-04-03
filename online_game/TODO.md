###[Back to README](README.md)

####Todo list for ECE 559 Project.
* 'o' means the project is being worked on, 'x' means it is completed.

#####To be completed together 4/32/12
1. Fix skybox textures (wtf is going on?)
2. Work on wrapping a variable texture to ball
 * this is a requirement
3. Discuss plans for shaders
 * Requirement to have 3 seperate programs
 * One can run step algorithm (LUT) 
 * One could run convolution (trivial)
 * I can do this as we discussed it in lecture today
4. After that go our seperate ways and code.


####Michael
|Task         |Status      |
|-------------|:----------:|
| Framebuffer work | x |
| Jumbotron View (similar to mirror) | x |
| Integrate Jumbotron into stadium | o |
| Other stadium aspects | o |
| Warped textures | o |
| Blurred textures | o |
| Textures that change colors (w chris) | o |
| Create a cool floor | o |


####Chris

|Task         |Status      |
|-------------|:----------:|
| Text working for above ball (debug w mike) | o |
| Start placing variable numbers of balls | o |
| - with timers | o |
| - with texture that changes color | o |
| - Balls thrown out | x |
| - Bonus feature: throw up walls (more difficult) | x |
| - Implement bouncing balls | o |
| - Implement balls bouncing off walls | x |
| - Fix texture overlay on brick walls | o |
| - Fix disk class | o |

####Outstanding bugs
|Task         |Fixed?      |
|-------------|:----------:|
| 'Disk' crashes if slices > loops | o |
| Skybox has visible seams | o |
| GL viewport retains dimensions of GLframe (512 x 512) when GLframe is used | x |

####Presentation / cleanup
|Class         |Task         |Status      |Estimated time to completion     |
|-------------|:----------|:----------:|----------:|
| Overall | Get stadium looking good with new shaders | o | 2 hours |
| | Fix window resizing function | MST | 30 mins |
| Intro | texture loading | o | 1 hour |
|  | Pass in number of balls (HTML interface) | MST | 10 mins |
| Movement | accelerate over time | CRA |
|  | get rid of stutter-step when key is held down | CRA |
| Lighting | make specular highlight on floor behave correctly | MST | 30 mins |
|  | place light | o |
| Objects | Integrate Jumbotron into stadium | o |
|  | Set up displays on Jumbotron screen | MST | 2 hours |
|  | Add effect to balls with extra shader | MST | 20 mins |
|  | Add effect to floor with extra shader | MST | 20 mins |
| Modes | God mode | o |
|  | Wireframe mode | o |
|  | Shader toggling | MST | 20 mins |
| Outro | Exit game mode | o |
|  | Output final time / whether you have won | CRA |

|Task         |Status      |
|-------------|:----------:|
| Background music | o |
| Sound effects | o |
| Text wrapping to Jumbotron cylinders (see pic) | o |
| Debug mode toggling | o |
| introduction screen | o |
| Live editing | o |
