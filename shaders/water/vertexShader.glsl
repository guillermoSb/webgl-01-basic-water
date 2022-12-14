
attribute vec4 tangent;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vFragPosition;
varying vec4 vTangent;
varying mat3 vTBN;


void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;


	vec3 T = normalize(vec3(tangent));
	vec3 N = normalize(normal);
	vec3 B = normalize(cross(N,T));
	mat3 TBN = mat3(T,B,N);
	
	// Set the position
	gl_Position = projectedPosition;
	// Set varyings
	vUv = uv;
	vFragPosition = vec3(modelPosition);
	vTangent = tangent;
	vTBN = TBN;
}