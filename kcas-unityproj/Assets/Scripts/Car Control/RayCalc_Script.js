#pragma strict

private var frontLeftRay : Component;
private var frontRightRay : Component;
public var leftAngle : float;
public var rightAngle : float;

function Start () {
	frontLeftRay = transform.Find("FrontLeftRay");
	frontRightRay = transform.Find("FrontRightRay");
}

function Update () {
	var rayLength = frontLeftRay.GetComponent(RayDraw_Script).rayLength;
	var leftHit : RaycastHit;
	var rightHit : RaycastHit;
	var curveAngle : float;
	
	var collisionLeft = Physics.Raycast (frontLeftRay.transform.position, frontLeftRay.transform.forward, leftHit, rayLength, Physics.kDefaultRaycastLayers);
	var collisionRight = Physics.Raycast (frontRightRay.transform.position, frontRightRay.transform.forward, rightHit, rayLength, Physics.kDefaultRaycastLayers);
	
	if (collisionLeft && !collisionRight) {
		// little right turn for stabilization 
		leftAngle = 0.0f;
		rightAngle = 5.0f;
	}
	else if (!collisionLeft && collisionRight) {
		// little left turn for stabilization 
		leftAngle = 5.0f;
		rightAngle = 0.0f;
	}
	else if (collisionLeft && collisionRight) {
		// calc the steering direction
		
		curveAngle = Vector2.Angle(
			new Vector2(rightHit.point.x - leftHit.point.x, rightHit.point.z - leftHit.point.z).normalized, 
			new Vector2(frontLeftRay.transform.forward.x, frontLeftRay.transform.forward.z).normalized
		);
		
		if (curveAngle > 90) {
			// Left turn
			leftAngle = (curveAngle - 180)*(-1);
			rightAngle = 0.0f;
			//print("Curva a SINISTRA a " + leftAngle);
		}
		else {
			// Right turn
			rightAngle = curveAngle;
			leftAngle = 0.0f;
			//print("Curva a DESTRA a " + rightAngle);
		}
	}
	else {
		// no collisions, go straight
		leftAngle = 0.0f;
		rightAngle = 0.0f;
	}
}