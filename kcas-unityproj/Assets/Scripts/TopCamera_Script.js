#pragma strict

function Start () {

}

function Update () {
	transform.position.x = GameObject.Find("AICar").transform.position.x;
	transform.position.z = GameObject.Find("AICar").transform.position.z;
}