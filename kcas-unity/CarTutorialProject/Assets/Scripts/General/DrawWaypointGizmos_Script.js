function OnDrawGizmos () {
	// make a new array of waypoints, then set it to all of the transforms in the current object
	var waypoints = gameObject.GetComponentsInChildren( Transform );
	
	// now loop through all of them and draw gizmos for each of them
	for ( var waypoint : Transform in waypoints ) {
		Gizmos.DrawSphere( waypoint.position, 1.0 );
	}
	
}