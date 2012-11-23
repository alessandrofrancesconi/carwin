#pragma strict

public var rayLength : int = 40;

public var turnAngle : int;

/* distance of the collision in discrete values */
public var frontCollisionDist : int;
public var leftCollisionDist : int;
public var rightCollisionDist : int;

private var frontLeftRay : Component;
private var frontRightRay : Component;
private var sideLeftRay : Component;
private var sideRightRay : Component;

private var numDiscretDistance : int = 8; // how many discretizations for Collision Distance?

function Start () {
	frontLeftRay = transform.Find("FrontLeftRay");
	frontRightRay = transform.Find("FrontRightRay");
	sideLeftRay = transform.Find("SideLeftRay");
	sideRightRay = transform.Find("SideRightRay");
}

function CalcCollisions () {
	var leftHit : RaycastHit;
	var rightHit : RaycastHit;
	var leftSideHit : RaycastHit;
	var rightSideHit : RaycastHit;
	
	// front colliders
	var collisionLeft = Physics.Raycast (frontLeftRay.transform.position, frontLeftRay.transform.forward, leftHit, rayLength, Physics.kDefaultRaycastLayers);
	var collisionRight = Physics.Raycast (frontRightRay.transform.position, frontRightRay.transform.forward, rightHit, rayLength, Physics.kDefaultRaycastLayers);
	// side colliders
	var collisionSideLeft = Physics.Raycast (sideLeftRay.transform.position, sideLeftRay.transform.forward, leftSideHit, rayLength, Physics.kDefaultRaycastLayers);
	var collisionSideRight = Physics.Raycast (sideRightRay.transform.position, sideRightRay.transform.forward, rightSideHit, rayLength, Physics.kDefaultRaycastLayers);
	
	// check the front distance
	if (collisionLeft && !collisionRight) {
		// little right turn for stabilization 
		turnAngle = 5.0f;
		frontCollisionDist = leftHit.distance;
	}
	else if (!collisionLeft && collisionRight) {
		// little left turn for stabilization 
		turnAngle = -5.0f;
		frontCollisionDist = rightHit.distance;
	}
	else if (collisionLeft && collisionRight) {
		// calc the turn angle (from -90 to 90)
		
		var curveAngle : int = Mathf.Round(Vector2.Angle(
			new Vector2(rightHit.point.x - leftHit.point.x, rightHit.point.z - leftHit.point.z).normalized, 
			new Vector2(frontLeftRay.transform.forward.x, frontLeftRay.transform.forward.z).normalized
		));
		
		if (curveAngle > 90) {
			// Left turn
			turnAngle = (curveAngle - 180) ;
		}
		else {
			// Right turn
			turnAngle = curveAngle;
		}
		
		frontCollisionDist = (leftHit.distance + rightHit.distance) / 2;
	} 
	else {
		// no collisions, it's a straight stretch
		turnAngle = 0.0f;	
		frontCollisionDist = rayLength + 1;
	}
	
	// check the side distance
	if (!collisionSideLeft)
		leftCollisionDist = rayLength + 1;
	else	{
		leftCollisionDist = leftSideHit.distance;
	}
	if (!collisionSideRight)
		rightCollisionDist = rayLength + 1;
	else	{
		rightCollisionDist = rightSideHit.distance;
	}
	
	
	/*
	// discretize front and side collision distances in 'numDiscretDistance' parts
	var interval = Mathf.Round(rayLength / numDiscretDistance);
	var i : int;
	for (i = 0; i < numDiscretDistance ; i++) {
		var leftLim = i * interval;
		var rightLim = leftLim + interval - 1;
		
		if (frontCollisionDist >= leftLim && frontCollisionDist <= rightLim) {
			frontCollisionDist = (leftLim + rightLim) / 2;
			break;
		}
	}
	for (i = 0; i < numDiscretDistance ; i++) {
		leftLim = i * interval;
		rightLim = leftLim + interval - 1;
		
		if (leftCollisionDist >= leftLim && leftCollisionDist <= rightLim) {
			leftCollisionDist = (leftLim + rightLim) / 2;
			break;
		}
	}
	for (i = 0; i < numDiscretDistance ; i++) {
		leftLim = i * interval;
		rightLim = leftLim + interval - 1;
		
		if (rightCollisionDist >= leftLim && rightCollisionDist <= rightLim) {
			rightCollisionDist = (leftLim + rightLim) / 2;
			break;
		}
	}
	*/
}