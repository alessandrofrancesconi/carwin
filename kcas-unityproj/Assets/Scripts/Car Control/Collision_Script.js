#pragma strict

function Start () {

}

function Update () {

}


function OnCollisionEnter(collision : Collision) {
	print(collision.gameObject.name);
}