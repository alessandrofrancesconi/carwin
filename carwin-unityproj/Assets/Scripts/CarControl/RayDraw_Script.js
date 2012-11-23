#pragma strict


public var ray : Ray;
public var rayRendColor : Color;

private var rayRend : LineRenderer;

function Start () {
	rayRend = gameObject.AddComponent(LineRenderer);
	rayRend.material.color = rayRendColor;
	
	rayRend.SetVertexCount(2);
	rayRend.SetWidth(0.1f, 0.1f);
}

function Update () {
	ray = new Ray (transform.position, transform.forward);
	
	rayRend.SetPosition(0, ray.origin);
	
	var rayLength = GameObject.Find("RayTracing").GetComponent(RayCalc_Script).rayLength;
	rayRend.SetPosition(1, ray.origin + (transform.forward * rayLength));
}