#pragma strict

function Start () {
	
}

function Update () {

}

function OnCollisionEnter(collision : Collision) {
    // Debug-draw all contact points and normals
    for (var contact : ContactPoint in collision.contacts) {
        Debug.DrawRay(contact.point, contact.normal, Color.white);
    }
    
    var auto:GameObject = GameObject.Find("AICar");
	var scriptMaster:AICar_Script = auto.GetComponent("AICar_Script");
	scriptMaster.prova();
    
    //Debug.Log("Collisione con " + collision.gameObject.name);
}

