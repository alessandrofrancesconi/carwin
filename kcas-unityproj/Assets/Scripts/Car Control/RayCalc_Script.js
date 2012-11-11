#pragma strict

private var frontLeftRay : Component;
private var frontRightRay : Component;
public var leftAngle : float;
public var rightAngle : float;
public var frontCollisionDist : float;

// quanto discretizzo la distanza?
public var numDiscretDistance:float;
// questi valori saranno il punto al centro dell'intervallo di appartenenza
var frontLeftDistance :float;
var frontRightDistance :float;

private var aicarScript:AICar_Script;

private enum TurnTypeEnum { 
	STRAIGHT = 0, 
	LEFT, 
	RIGHT
};
public var turnType : TurnTypeEnum;

function Start () {
	frontLeftRay = transform.Find("FrontLeftRay");
	frontRightRay = transform.Find("FrontRightRay");
	
	frontLeftDistance = 0;
	frontRightDistance = 0;
	
	var auto:GameObject = GameObject.Find("AICar");
	aicarScript = auto.GetComponent("AICar_Script");
}

function Update () {
	var rayLength = frontLeftRay.GetComponent(RayDraw_Script).rayLength;
	var leftHit : RaycastHit;
	var rightHit : RaycastHit;
	var curveAngle : float;
	
	
	var collisionLeft = Physics.Raycast (frontLeftRay.transform.position, frontLeftRay.transform.forward, leftHit, rayLength, Physics.kDefaultRaycastLayers);
	var collisionRight = Physics.Raycast (frontRightRay.transform.position, frontRightRay.transform.forward, rightHit, rayLength, Physics.kDefaultRaycastLayers);
	
	if(collisionLeft)
	aicarScript.myPrint("Distanza " + leftHit.distance + " discretizz " + numDiscretDistance );
	
	// aggiorna le 2 distanze dei raggi frontali che comporranno il cromosoma (occorre discretizzare questi valori, diciamo a 6 valori)
	for (var i=1; i <= numDiscretDistance; i++)
	{
		if(collisionLeft)	{
			if (leftHit.distance < (rayLength / numDiscretDistance) * i)	{
				var tmp:float = ((rayLength / numDiscretDistance) * (i-1) + (rayLength / numDiscretDistance) * i) / 2;
				tmp = Mathf.Round(tmp * 100f) / 100f;
				aicarScript.myPrint("Left discrete distance: " + tmp);
				frontLeftDistance = tmp;
				break;
			}
		}	else	{
			frontLeftDistance = Mathf.Round(rayLength + rayLength / numDiscretDistance / 2 * 100f) / 100f;
		}
	}
	for (var i2=1; i2 <= numDiscretDistance; i2++)
	{
		if(collisionRight)	{
			if (rightHit.distance < (rayLength / numDiscretDistance) * i2)	{
				tmp = ((rayLength / numDiscretDistance) * (i2-1) + (rayLength / numDiscretDistance) * i2	) / 2;
				tmp = Mathf.Round(tmp * 100f) / 100f;
				aicarScript.myPrint("Left discrete distance: " + tmp);
				frontRightDistance = tmp;
				break;
			}
		}	else	{
			frontRightDistance = Mathf.Round(rayLength + rayLength / numDiscretDistance / 2 * 100f) / 100f;
		}
	}
	
	frontLeftDistance = leftHit.distance;
	frontRightDistance = rightHit.distance;
	
	if (collisionLeft && !collisionRight) {
		// little right turn for stabilization 
		leftAngle = 0.0f;
		rightAngle = 5.0f;
		turnType = TurnTypeEnum.RIGHT;
		frontCollisionDist = leftHit.distance;
	}
	else if (!collisionLeft && collisionRight) {
		// little left turn for stabilization 
		leftAngle = 5.0f;
		rightAngle = 0.0f;
		turnType = TurnTypeEnum.LEFT;
		frontCollisionDist = rightHit.distance;
	}
	else if (collisionLeft && collisionRight) {
		// calc the steering direction
		
		curveAngle = Vector2.Angle(
			new Vector2(rightHit.point.x - leftHit.point.x, rightHit.point.z - leftHit.point.z).normalized, 
			new Vector2(frontLeftRay.transform.forward.x, frontLeftRay.transform.forward.z).normalized
		);
		// Debug.Log("Angolo " + leftHit.collider.gameObject.name);
		
		if (curveAngle > 90) {
			// Left turn
			leftAngle = (curveAngle - 180)*(-1);
			rightAngle = 0.0f;
			turnType = TurnTypeEnum.LEFT;
		}
		else {
			// Right turn
			rightAngle = curveAngle;
			leftAngle = 0.0f;
			turnType = TurnTypeEnum.RIGHT;
		}
		
		frontCollisionDist = (leftHit.distance < rightHit.distance ? leftHit.distance : rightHit.distance);
	}
	else {
		// no collisions, go straight
		leftAngle = 0.0f;
		rightAngle = 0.0f;
		turnType = TurnTypeEnum.STRAIGHT;		
		frontCollisionDist = rayLength + 1;
	}
	
}