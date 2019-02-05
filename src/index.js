import vertexSource from './maldelbrot.vertex.glsl';
import fragmentSource from './maldenbrot.fragment.glsl';


/***************************************************Getting context**************************************/
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

/***************************************************Linking program**************************************/
const program = gl.createProgram();
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vertexSource);
gl.shaderSource(fragmentShader, fragmentSource);

gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

console.log("Vertex shader");
console.log(gl.getShaderInfoLog(vertexShader));

console.log("Fragment shader");
console.log(gl.getShaderInfoLog(fragmentShader));

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
/***************************************************Generate points*************************************/
function generatePoints(){
    let list = [];
    for(let i = 0; i < 600; ++i){
        for(let j = 0; j < 600; ++j){
            list.push(i/300-1);
            list.push(j/300-1);
        }
    }
    return new Float32Array(list);
}

/***************************************************Vertex buffers**************************************/

const POINTS = generatePoints();

function initVertexBuffers(gl, program) {
    const vertices = POINTS;
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    return vertices.length/2;
}
/***************************************************Drawing points**************************************/

const ZOOM_C = Math.pow(2,1/5);

class Drawer{

    constructor(gl, program, canvas){
        this.gl = gl;
        this.program = program;
        this.canvas = canvas;
        this.offset = [0,0];
        this.scale = 2.0;
        this.dragCoordinates = null;
        this.dragOffset = null;
        this.UI = {
            'x0': document.getElementById('x0'),
            'y0': document.getElementById('y0'),
            'k': document.getElementById('k'),
        };
        this.startDrag = this.startDrag.bind(this);
        this.drag = this.drag.bind(this);
        this.endDrag = this.endDrag.bind(this);
        this.zoom = this.zoom.bind(this);
        this.initHandlers();
    }

    updateUI(){
        for(let i in this.UI){
            switch(i){
                case 'x0':
                    this.UI[i].value = this.offset[0];
                    break;
                case 'y0':
                    this.UI[i].value = this.offset[1];
                    break;
                case 'k':
                    this.UI[i].value = this.scale;
                    break;
            }
        }
    }

    draw(){

        this.updateUI();
        const gl = this.gl;
        const program = this.program;

        gl.clearColor(1,1,1,1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        const offset_x = gl.getUniformLocation(program, "offset_x");
        const offset_y = gl.getUniformLocation(program, "offset_y");
        const scale = gl.getUniformLocation(program, "scale");

        gl.uniform1f(offset_x, this.offset[0]);
        gl.uniform1f(offset_y, this.offset[1]);
        gl.uniform1f(scale, this.scale);

        const n = initVertexBuffers(gl, program);

        gl.drawArrays(gl.Points, 0, n);
    }

    initHandlers(){
        const canvas = this.canvas;

        canvas.addEventListener('mousedown', this.startDrag);
        canvas.addEventListener('mouseup', this.endDrag);
        canvas.addEventListener('mouseleave', this.endDrag);
        canvas.addEventListener('mousemove', this.drag);
        canvas.addEventListener('wheel', this.zoom);
    }

    startDrag(e){
        this.dragCoordinates = [e.clientX, e.clientY];
        this.dragOffset = [...this.offset];
    }

    drag(e){
        if(!this.dragCoordinates) return;
        const dx = this.dragCoordinates[0] - e.clientX;
        const dy = e.clientY - this.dragCoordinates[1];
        this.offset[0] = this.dragOffset[0] + this.scale*(dx/300);
        this.offset[1] = this.dragOffset[1] + this.scale*(dy/300);
        this.draw();
    }

    endDrag(e){
        this.dragCoordinates = null;
        this.dragOffset = null;
    }

    zoom(e){
        const delta = parseInt(e.deltaY/100);
        this.scale *= Math.pow(ZOOM_C,delta);
        this.draw();
    }

}

const drawer = new Drawer(gl, program, canvas);
drawer.draw();
