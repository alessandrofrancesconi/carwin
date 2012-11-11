// ----------- CAR TUTORIAL SAMPLE PROJECT, ? Andrew Gotow 2009 -----------------

// Here's the basic car script described in my tutorial at www.gotow.net/andrew/blog.
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

private var brainComponent : Component;

public function prova()
{
	Debug.Log("Ho colliso ");
}

function Start () {
	// I usually alter the center of mass to make the car more stable. I'ts less likely to flip this way.
	rigidbody.centerOfMass.y = -1.5;
	brainComponent = GameObject.Find("Brain").GetComponent(NeuralNet_Script);
	brainComponent.brain = NeuralNetwork();
}

function Update () {
	
	// This is to limith the maximum speed of the car, adjusting the drag probably isn't the best way of doing it,
	// but it's easy, and it doesn't interfere with the physics processing.
	rigidbody.drag = rigidbody.velocity.magnitude / 250;
	
	// Compute the engine RPM based on the average RPM of the two wheels, then call the shift gear function
	EngineRPM = (FrontLeftWheel.rpm + FrontRightWheel.rpm)/2 * GearRatio[CurrentGear];
	ShiftGears();
	
	var inputs : float[] = new float[parseInt(NN_INPUT.COUNT)];
	inputs[parseInt(NN_INPUT.SPEED)] = (rigidbody.velocity.magnitude >= 0.1f ? rigidbody.velocity.magnitude : 0.0f);
	inputs[parseInt(NN_INPUT.FRONT_COLLISION_DIST)] = GameObject.Find("RayTracing").GetComponent(RayCalc_Script).frontCollisionDist;
	
	if (GameObject.Find("RayTracing").GetComponent(RayCalc_Script).leftAngle < 0.0f) {
		inputs[parseInt(NN_INPUT.TURN_ANGLE)] = GameObject.Find("RayTracing").GetComponent(RayCalc_Script).leftAngle;
	} 
	else if (GameObject.Find("RayTracing").GetComponent(RayCalc_Script).rightAngle > 0.0f) {
		inputs[parseInt(NN_INPUT.TURN_ANGLE)] = GameObject.Find("RayTracing").GetComponent(RayCalc_Script).rightAngle;
	}
	else {
		inputs[parseInt(NN_INPUT.TURN_ANGLE)] = 0.0f;
	}
	
	brainComponent.brain.SetInputs(inputs);
	brainComponent.brain.Update();
	
	var outputs : float[] = brainComponent.brain.GetOutputs();
	FrontLeftWheel.motorTorque = FrontRightWheel.motorTorque = EngineTorque / GearRatio[CurrentGear] * outputs[parseInt(NN_OUTPUT.ACCELERATION)];
	FrontLeftWheel.steerAngle = FrontRightWheel.steerAngle = 20 * (outputs[parseInt(NN_OUTPUT.STEERING_FORCE)]*2-1);
	
	/*
	// finally, apply the values to the wheels.	The torque applied is divided by the current gear, and
	// multiplied by the user input variable.
	FrontLeftWheel.motorTorque = EngineTorque / GearRatio[CurrentGear] * Input.GetAxis("Vertical");
	FrontRightWheel.motorTorque = EngineTorque / GearRatio[CurrentGear] * Input.GetAxis("Vertical");
		
	// the steer angle is an arbitrary value multiplied by the user input.
	var leftAngle = GameObject.Find("RayTracing").GetComponent(RayCalc_Script).leftAngle / -90;
	var rightAngle = GameObject.Find("RayTracing").GetComponent(RayCalc_Script).rightAngle / 90;
	
	FrontLeftWheel.steerAngle = 23 * leftAngle;
	FrontRightWheel.steerAngle = 23 * rightAngle;
	*/
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

function myPrint(str:String)
{
	Debug.Log(str);
}

function OnCollisionStay(collision : Collision) {
    // Debug-draw all contact points and normals
    for (var contact : ContactPoint in collision.contacts) {
        Debug.DrawRay(contact.point, contact.normal, Color.white);
        if (contact.normal != Vector3.up)
        	Debug.Log("Collisione con " + contact.normal);
    }
    /*
    var auto:GameObject = GameObject.Find("AICar");
	var scriptMaster:AICar_Script = auto.GetComponent("AICar_Script");
	scriptMaster.prova();*/
    
    //Debug.Log("Collisione con " + collision.gameObject.name);
}
