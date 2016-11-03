/*uniform float uS0, uT0;
uniform float uPower;
uniform sampler2D uImageUnit;

in vec2 vST;

void
main( )
{
	vec2 delta = vST - vec2(uS0,uT0);

	vec2 st = vec2(uS0,uT0) + sign(delta) * pow( abs(delta), uPower );

	vec3 rgb = texture2D( uImageUnit, st ).rgb;

	gl_FragColor = vec4( rgb, 1. );
}



*/
vec3 getSharpen(vec2 newST);
uniform sampler2D uImageUnit;

in vec2 vST;
uniform float uScenter,uTcenter,uDs,uDt;
uniform float uMagFactor,uRotAngle,uSharpFactor;


void
main( )
{

	//Something in here made it a circle
	//vec2 center = vec2(uScenter,uTcenter);
	vec2 size = vec2(uDs,uDt);
	//vec2 delta = vST - vec2(uScenter,uTcenter);
	vec2 center = vec2(uScenter,uTcenter);
	vec2 sizeMax = vec2(uDs+uScenter,uDt+uTcenter);
	vec2 delta = vST - center;
	vec2 length2 = sizeMax-center;
	vec2 lengthRect = vec2(uDs,uDt);

	float circleRadius = abs(center-size);
	float myLength = abs(vST - center);

	//Get the Color
	vec3 rgb = texture2D( uImageUnit, vST ).rgb;
	
	//For Rectangle
	//if(abs(vST.s - uScenter) <= uDs && )
	//{	
		//Find our Vertical length
		//if(abs(vST.t-uTcenter) <= uDt)
		//{

			//For circle
			if( length(delta) <= length(lengthRect) )			//Apply magnification inside the rectangle
			{
			vec2 st = center + sign(delta) * (abs(delta) * uMagFactor );

			//If we're applying rotation do that
			vec2 mySRot = st-center;
			float sPrime = (mySRot.s)*cos(uRotAngle) - (mySRot.t)*sin(-uRotAngle);
			float tPrime = (mySRot.s)*sin(-uRotAngle) + (mySRot.t)*cos(uRotAngle);
			vec2 newST = vec2(sPrime,tPrime);
			//Render the texture at these coordinates
			rgb = texture2D(uImageUnit,newST+center).rgb;
					
			vec3 target = vec3(0.,0.,0.);
			//Apply Sharpening
			target = getSharpen(newST+center);
			//ivec3 irgb = ivec3(rgb.rgb);
			gl_FragColor = vec4( mix( target, rgb, uSharpFactor ), 1. );
		
		}

		//else{gl_FragColor = vec4( rgb, 1. );}
	//}
	//Otherwise it's outside of the magic lens	
	else
	{
		gl_FragColor = vec4( rgb, 1. );
	}
}

vec3 getSharpen(vec2 newST)
{

ivec2 ires = textureSize(uImageUnit,0);
float ResS = float(ires.s);
float ResT = float(ires.t);
vec2 stp0 = vec2(1./ResS, 0. );
vec2 st0p = vec2(0. , 1./ResT);
vec2 stpp = vec2(1./ResS, 1./ResT);
vec2 stpm = vec2(1./ResS, -1./ResT);
vec3 i00 = texture2D( uImageUnit, newST ).rgb;
vec3 im1m1 = texture2D( uImageUnit, newST-stpp ).rgb;
vec3 ip1p1 = texture2D( uImageUnit, newST+stpp ).rgb;
vec3 im1p1 = texture2D( uImageUnit, newST-stpm ).rgb;
vec3 ip1m1 = texture2D( uImageUnit, newST+stpm ).rgb;
vec3 im10 = texture2D( uImageUnit, newST-stp0 ).rgb;
vec3 ip10 = texture2D( uImageUnit, newST+stp0 ).rgb;
vec3 i0m1 = texture2D( uImageUnit, newST-st0p ).rgb;
vec3 i0p1 = texture2D( uImageUnit, newST+st0p ).rgb;
vec3 target = vec3(0.,0.,0.);
target += 1.*(im1m1+ip1m1+ip1p1+im1p1);
target += 2.*(im10+ip10+i0m1+i0p1);
target += 4.*(i00);
target /= 16.;

return target;
}
