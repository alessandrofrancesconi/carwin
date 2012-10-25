// ----------- CAR TUTORIAL SAMPLE PROJECT, ? Andrew Gotow 2009 -----------------

// Here's the basic AI driven car script described in my tutorial at www.gotow.net/andrew/blog.
// A Complete explaination of how this script works can be found at the link above, along
// with detailed instructions on how to write one of your own, and tips on what values to 
// assign to the script variables for it to work well for your application.

// Contact me at Maxwelldoggums@Gmail.com for more information.




// These variables allow the script to power the wheels of the car.
var FrontLeftWheel : WheelCollider;
var FrontRightWheel : WheelCollider;

// These variables are for the gears, the array is the list of ratios. The script
// uses the defined gear ratios to determine how much torque to apply to the wheels.
var GearRatio : float[];
var CurrentGear : int = 0;

// These variables are just for applying torque to the wheels and shifting gears.
// using the defined Max and Min Engine RPM, the script can determine what gear the
// car needs to be in.
var EngineTorque : float = 600.0;
var MaxEngineRPM : float = 3000.0;
var MinEngineRPM : float = 1000.0;
private var EngineRPM : float = 0.0;

// Here's all the variables for the AI, the waypoints are determined in the "GetWaypoints" function.
// the waypoint container is used to search for all the waypoints in the scene, and the current
// waypoint is used to determine which waypoint in the array the car is aiming for.
var waypointContainer : GameObject;
private var waypoints : Array;
private var currentWaypoint : int = 0;

// input steer and input torque are the values substituted out for the player input. The 
// "NavigateTowardsWaypoint" function determines values to use for these variables to move the car
// in the desired direction.
private var inputSteer : float = 0.0;
private var inputTorque : float = 0.0;

function Start () {
	// I usually alter the center of mass to make the car more stable. I'ts less likely to flip this way.
	rigidbody.centerOfMass.y = -1.5;
	
	// Call the function to determine the array of waypoints. This sets up the array of points by finding
	// transform components inside of a source container.
	GetWaypoints();
}

function Update () {
	
	// This is to limith the maximum speed of the car, adjusting the drag probably isn't the best way of doing it,
	// but it's easy, and it doesn't interfere with the physics processing.
	rigidbody.drag = rigidbody.velocity.magnitude / 250;
	
	// Call the funtion to determine the desired input values for the car. This essentially steers and
	// applies gas to the engine.
	NavigateTowardsWaypoint();
	
	// Compute the engine RPM based on the average RPM of the two wheels, then call the shift gear function
	EngineRPM = (FrontLeftWheel.rpm + FrontRightWheel.rpm)/2 * GearRatio[CurrentGear];
	ShiftGears();

	// set the audio pitch to the percentage of RPM to the maximum RPM plus one, this makes the sound play
	// up to twice it's pitch, where it will suddenly drop when it switches gears.
	audio.pitch = Mathf.Abs(EngineRPM / MaxEngineRPM) + 1.0 ;
	// this line is just to ensure that the pitch does not reach a value higher than is desired.
	if ( audio.pitch > 2.0 ) {
		audio.pitch = 2.0;
	}
	
	// finally, apply the values to the wheels.	The torque applied is divided by the current gear, and
	// multiplied by the calculated AI input variable.
	FrontLeftWheel.motorTorque = EngineTorque / GearRatio[CurrentGear] * inputTorque;
	FrontRightWheel.motorTorque = EngineTorque / GearRatio[CurrentGear] * inputTorque;
		
	// the steer angle is an arbitrary value multiplied by the calculated AI input.
	FrontLeftWheel.steerAngle = 10 * inputSteer;
	FrontRightWheel.steerAngle = 10 * inputSteer;
}

function ShiftGears() {
	// this funciton shifts the gears of the vehcile, it loops through all the gears, checking which will make
	// the engine RPM fall within the desired range. The gear is then set to this "appropriate" value.
	if ( EngineRPM >= MaxEngineRPM ) {
		var AppropriateGear : int = CurrentGear;
		
		for ( var i = 0; i < GearRatio.length; i ++ ) {
			if ( FrontLeftWheel.rpm * GearRatio[i] < MaxEngineRPM ) {
				AppropriateGear = i;
				break;
			}
		}
		
		CurrentGear = AppropriateGear;
	}
	
	if ( EngineRPM <= MinEngineRPM ) {
		AppropriateGear = CurrentGear;
		
		for ( var j = GearRatio.length-1; j >= 0; j -- ) {
			if ( FrontLeftWheel.rpm * GearRatio[j] > MinEngineRPM ) {
				AppropriateGear = j;
				break;
			}
		}
		
		CurrentGear = AppropriateGear;
	}
}

function GetWaypoints () {
	// Now, this function basically takes the container object for the waypoints, then finds all of the transforms in it,
	// once it has the transforms, it checks to make sure it's not the container, and adds them to the array of waypoints.
	var potentialWaypoints : Array = waypointContainer.GetComponentsInChildren( Transform );
	waypoints = new Array();
	
	for ( var potentialWaypoint : Transform in potentialWaypoints ) {
		if ( potentialWaypoint != waypointContainer.transform ) {
			waypoints[ waypoints.length ] = potentialWaypoint;
		}
	}
}

function NavigateTowardsWaypoint () {
	// now we just find the relative position of the waypoint from the car transform,
	// that way we can determine how far to the left and right the waypoint is.
	var RelativeWaypointPosition : Vector3 = transform.InverseTransformPoint( Vector3( 
												waypoints[currentWaypoint].position.x, 
												transform.position.y, 
												waypoints[currentWaypoint].position.z ) );
																				
																				
	// by dividing the horizontal position by the magnitude, we get a decimal percentage of the turn angle that we can use to drive the wheels
	inputSteer = RelativeWaypointPosition.x / RelativeWaypointPosition.magnitude;
	
	// now we do the same for torque, but make sure that it doesn't apply any engine torque when going around a sharp turn...
	if ( Mathf.Abs( inputSteer ) < 0.5 ) {
		inputTorque = RelativeWaypointPosition.z / RelativeWaypointPosition.magnitude - Mathf.Abs( inputSteer );
	}else{
		inputTorque = 0.0;
	}
	
	// this just checks if the car's position is near enough to a waypoint to count as passing it, if it is, then change the target waypoint to the
	// next in the list.
	if ( RelativeWaypointPosition.magnitude < 20 ) {
		currentWaypoint ++;
		
		if ( currentWaypoint >= waypoints.length ) {
			currentWaypoint = 0;
		}
	}
	
}