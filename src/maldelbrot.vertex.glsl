attribute vec4 a_Position;
varying vec4 v_color;
uniform float offset_x;
uniform float offset_y;
uniform float scale;


vec3 hsv2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 process(vec2 z, vec2 w){
    float x = z.x*z.x - z.y*z.y +w.x;
    float y = 2.0*z.x*z.y + w.y;
    return vec2(x,y);
}

float radius(vec2 z){
    return sqrt(z.x*z.x + z.y*z.y);
}

float maldenbrot(float x, float y){
    vec2 z = vec2(0.0, 0.0);
    vec2 w = vec2(x,y);
    for(int i = 0; i < 4000; ++i){
        if(radius(z) >= 2.0){
            float res = float(i);
            return res/4000.0;
        }
        z = process(z,w);
    }
    return  1.0;
}

vec3 getColor(float z){
    int color = int(ceil((1.0-z)*5.0));
    float d = fract((1.0-z)*5.0);
    if(color == 0){
        return vec3(0.0, 0.0, 0.0);
    }else if(color == 1){
        return vec3(0.0, 0.0, d);
    }else if(color == 2){
        return vec3(0.0, d, 1.0);
    }else if(color == 3){
        return vec3(0.0, 1.0, 1.0-d);
    }else if(color == 4){
        return vec3(d, 1.0, 0.0);
    }else{
        return vec3(1.0, 1.0, d);
    }
}


void main(){
    float x = a_Position.x;
    float y = a_Position.y;
    float z = maldenbrot(scale*x+offset_x,scale*y+offset_y);
    vec3 rgb = getColor(z);
    v_color = vec4(rgb, 1.0);
    gl_Position = a_Position;
    gl_PointSize = 1.0;
}
