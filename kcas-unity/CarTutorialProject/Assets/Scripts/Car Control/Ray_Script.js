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
	var rayLength = frontLeftRay.GetComponent(RayTrace_Script).rayLength;
	var leftHit : RaycastHit;
	var rightHit : RaycastHit;
	var curveAngle : float;
	
	if (Physics.Raycast (frontLeftRay.transform.position, frontLeftRay.transform.forward, leftHit, rayLength, Physics.kDefaultRaycastLayers) && 
		Physics.Raycast (frontRightRay.transform.position, frontRightRay.transform.forward, rightHit, rayLength, Physics.kDefaultRaycastLayers)) {
			var tmp1: Vector2 = new Vector2(rightHit.point.x - leftHit.point.x, rightHit.point.z - leftHit.point.z);
			var tmp2: Vector2 = new Vector2(frontLeftRay.transform.forward.x, frontLeftRay.transform.forward.z);
			
			curveAngle = Vector2.Angle(tmp2.normalized, tmp1.normalized);
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
}