varying vec3 uNormal;
varying vec3 uFragPosition;
void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	gl_Position = projectedPosition;
	
	uNormal =  normal;
	uFragPosition = vec3(modelPosition);
}