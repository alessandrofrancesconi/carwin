#pragma strict

public var turnAngle : int;
public var frontCollisionDist : float;

public var rayLength : int = 40;

private var frontLeftRay : Component;
private var frontRightRay : Component;
private var numDiscretDistance : int = 8; // how many discretizations for Collision Distance?

function Start () {
	frontLeftRay = transform.Find("FrontLeftRay");
	frontRightRay = transform.Find("FrontRightRay");
}

function Update () {
	var leftHit : RaycastHit;
	var rightHit : RaycastHit;
	var collisionLeft = Physics.Raycast (frontLeftRay.transform.position, frontLeftRay.transform.forward, leftHit, rayLength, Physics.kDefaultRaycastLayers);
	var collisionRight = Physics.Raycast (frontRightRay.transform.position, frontRightRay.transform.forward, rightHit, rayLength, Physics.kDefaultRaycastLayers);
	
	//Debug.Log(leftHit.collider.name);
	if ( collisionLeft && (leftHit.collider.name == "LapCollider") )
		return;
		
		
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
		// no collisions, go straight
		turnAngle = 0.0f;	
		frontCollisionDist = rayLength + 1;
	}
	
	var interval = Mathf.Round(rayLength / numDiscretDistance);
	for (var ii = 0; ii < numDiscretDistance ; ii++) {
		var leftLim = ii * interval;
		var rightLim = leftLim + interval - 1;
		
		if (frontCollisionDist >= leftLim && frontCollisionDist <= rightLim) {
			frontCollisionDist = (leftLim + rightLim) / 2;
			break;
		}
	}
}