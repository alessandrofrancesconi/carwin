#pragma strict

var ray : Ray;
var rayRendColor : Color;
var rayLength : int;
private var rayRend : LineRenderer;

function Start () {
	rayRend = gameObject.AddComponent(LineRenderer);
	rayRend.material.color = rayRendColor;
	
	rayRend.SetWidth(0.1f, 0.1f);	
	rayRend.SetVertexCount(2);
}

function Update () {
	ray = new Ray (transform.position, transform.forward);
	
	rayRend.SetPosition(0, ray.origin);
	rayRend.SetPosition(1, ray.origin + (transform.forward * rayLength));
}