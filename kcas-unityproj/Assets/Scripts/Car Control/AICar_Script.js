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
var EngineTorque : float = 1000.0;
var MaxEngineRPM : float = 3000.0;
var MinEngineRPM : float = 1000.0;
private var EngineRPM : float = 0.0;

private var brainComponent : Component;
private var geneticComponent : Component;
private var rayComponent : Component;

public var startPoint : GameObject;

private var mediumSpeed : float;
private var totDistance : float;
private var totFrames : int;
private var startTime : float;

/*
This function:
- starts a simulation
- update the fitnes of current chromosome at the end of the simulation (on collision event)
- if we have finished chromosome, do crossover etc...
*/
function Simulation()	{
	CancelInvoke("checkMoving");
	// - starts a simulation
	// puts the car in the correct start point
	transform.position = startPoint.transform.position;
	transform.rotation = startPoint.transform.rotation;
	rigidbody.velocity = rigidbody.angularVelocity = Vector3.zero;
	GameObject.Find("LapCollider").GetComponent(LapTime_Script).Start();
	
	// sets the current chromosome as weights of the NN
	brainComponent.brain.SetTotalWeights( 
		geneticComponent.population.GetCurrentChromosome().GetWeights()
	);
	
	// reset the fitness value
	geneticComponent.population.ResetFitness();
	totFrames = 0;
	mediumSpeed = 0;
	totDistance = 0;
	startTime = Time.time;
	Invoke("checkMoving", 5);
}

function Start () {
	// I usually alter the center of mass to make the car more stable. I'ts less likely to flip this way.
	rigidbody.centerOfMass.y = -1.5;
	
	brainComponent = GameObject.Find("Brain").GetComponent(NeuralNet_Script);
	brainComponent.brain = new NeuralNetwork();
	
	geneticComponent = GameObject.Find("Brain").GetComponent(GeneticAlgorithm_Script);
	geneticComponent.population = new Population(15, brainComponent.brain.GetTotalWeights().length);
	geneticComponent.population.InitRandomChromosomes();
	
	rayComponent = GameObject.Find("RayTracing").GetComponent(RayCalc_Script);
	
	Simulation();
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
	inputs[parseInt(NN_INPUT.FRONT_COLLISION_DIST)] = rayComponent.frontCollisionDist;
	inputs[parseInt(NN_INPUT.TURN_ANGLE)] = rayComponent.turnAngle;
	
	brainComponent.brain.SetInputs(inputs);
	brainComponent.brain.Update();
	
	var outputs : float[] = brainComponent.brain.GetOutputs();
	FrontLeftWheel.motorTorque = FrontRightWheel.motorTorque = EngineTorque / GearRatio[CurrentGear] * outputs[parseInt(NN_OUTPUT.ACCELERATION)];
	FrontLeftWheel.steerAngle = FrontRightWheel.steerAngle = 20 * (outputs[parseInt(NN_OUTPUT.STEERING_FORCE)]*2-1);
	
}

function FixedUpdate () {
	totDistance = totDistance + rigidbody.velocity.magnitude * Time.fixedDeltaTime;
	mediumSpeed = (mediumSpeed + rigidbody.velocity.magnitude*10) / ++totFrames;
	// update the fitness value
	geneticComponent.population.UpdateFitness();
}

function checkMoving() {
	if (mediumSpeed < 0.01) {
		restartSimulation();
	}
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

// - update the fitnes of current chromosome at the end of the simulation
function OnCollisionStay(collision : Collision) {
	for (var contact : ContactPoint in collision.contacts) {
        if (contact.normal != Vector3.up)	{
        	restartSimulation();
        	break;
        }
    }
}

// reset simulation, but with new chromosome
function restartSimulation() {
	// save current fitness value on last used chromosome
	geneticComponent.population.SetCurrentCromosomeFitness(
		//Mathf.RoundToInt(geneticComponent.population.GetCurrentFitness()) * mediumSpeed)
		Mathf.RoundToInt(totDistance / ((Time.time - startTime) / 2))
	);
	Debug.Log("Cromosoma corrente " + geneticComponent.population.GetCurrentChromosomeID() 
		+ " con fitness " + geneticComponent.population.GetCurrentCromosomeFitness()
		+ " vel media " + mediumSpeed);
	
	// go throught next chromosome
	geneticComponent.population.SetNextChromosome();
	
	if(geneticComponent.population.IsLastChromosome())	{
		// tried all the chromosomes, start a new generation.
		Debug.Log("Generation tested");
		geneticComponent.population.NewGeneration();
	}
	
	Simulation();
}