#pragma strict

private var higherView : boolean;

function Start () {
	higherView = false;
}

function Update () {
	
	if (Input.GetKeyDown (KeyCode.UpArrow)) {
		higherView = !higherView;
	}
	
	transform.position.x = GameObject.Find("AICar").transform.position.x;	
	transform.position.z = GameObject.Find("AICar").transform.position.z;
	
	if (higherView) transform.position.y = 150;
	else transform.position.y = 70;
}
