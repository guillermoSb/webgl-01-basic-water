
// Uniforms
uniform sampler2D uNormalTexture;
uniform float uTime;
uniform vec3 uViewPos;
uniform vec3 uLightPosition;
uniform float uAmbientLight;
uniform vec3 uWaterColor;
uniform vec3 uLightColor;
// Varyings
varying vec2 vUv;
varying vec3 vFragPosition;
varying mat3 vTBN;



vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}


void main() {
	// Variables
	vec3 waterColor = uWaterColor;
	vec2 newUv0 = vUv * 4.0;
	vec2 newUv1 = vUv * 4.0;
	newUv0.x += uTime * 0.07;
	newUv0.y += uTime * 0.07;
	newUv1.x -= uTime * 0.04;
	newUv1.y += uTime * 0.04;
	
	// Get the normal vector for the pixel
	vec3 n0 = texture2D(uNormalTexture, newUv0).rgb * 2.0 - 1.0;
	vec3 n1 = texture2D(uNormalTexture, newUv1).rgb * 2.0 - 1.0;
	n0 = normalize(vTBN * n0);
	n1 = normalize(vTBN * n1);
	vec3 surfaceNormal = normalize(mix(n0,n1,0.5));
	// Ambient Light
	float ambientStrength = uAmbientLight;
	vec3 ambient = ambientStrength * uLightColor;
	// Diffuse
	vec3 norm = surfaceNormal;
	vec3 lightDir = normalize(uLightPosition - vFragPosition);

	float diff = max(dot(norm, lightDir),0.0);
	vec3 diffuse = diff * uLightColor;
	// Specular
	float specularStrength = 1.0;
	vec3 viewDir = normalize(uViewPos - vFragPosition);
	vec3 reflectDir = reflect(-lightDir, norm);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 20.0);
	float specNoise = max(cnoise(vFragPosition.xz * 20.0), 0.5);
	vec3 specular = (specNoise * spec) * specularStrength * uLightColor;

	vec3 result = (ambient + diffuse+ specular) * waterColor;
	gl_FragColor = vec4(result, 0.5);
	// Assign the fragment color
}