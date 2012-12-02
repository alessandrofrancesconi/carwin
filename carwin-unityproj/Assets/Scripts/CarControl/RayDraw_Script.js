#pragma strict


public var ray : Ray;
public var rayRendColor : Color;

private var rayRend : LineRenderer;

function Start () {
	rayRend = gameObject.AddComponent(LineRenderer);
	rayRend.material.color = rayRendColor;
	rayRend.SetVertexCount(2);
}

function Update () {
	if (transform.parent.gameObject.GetComponent(RayCalc_Script).drawRays) {
		rayRend.SetWidth(0.15f, 0.15f);
		ray = new Ray (transform.position, transform.forward);
		
		rayRend.SetPosition(0, ray.origin);
		
		var rayLength = GameObject.Find("RayTracing").GetComponent(RayCalc_Script).rayLength;
		rayRend.SetPosition(1, ray.origin + (transform.forward * rayLength));
	}
	else rayRend.SetWidth(0.0f, 0.0f);
}