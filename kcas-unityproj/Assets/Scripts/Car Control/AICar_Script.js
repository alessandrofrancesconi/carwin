// ----------- CAR TUTORIAL SAMPLE PROJECT, ? Andrew Gotow 2009 -----------------

// Here's the basic car script described in my tutorial at www.gotow.net/andrew/blog.
// A Complete explaination of how this script works can be found at the link above, along
// with detailed instructions on how to write one of your own, and tips on what values to 
// assign to the script variables for it to work well for your application.

// Contact me at Maxwelldoggums@Gmail.com for more information.

import System;

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

private var avgSpeed : float; // average driving speed
private var totDistance : float; // the distance made by the car
private var lastPosition : Vector3; // the position of the car in the current frame
private var totFrames : int; // frames passed from the simulation start (used for avgSpeed)
private var totSpeed : int; // (used for avgSpeed)

/*	This function starts a new simulation  */
function startSimulation()	{
	CancelInvoke("checkMoving");
	
	// put the car in the initial position
	transform.position = startPoint.transform.position;
	transform.rotation = startPoint.transform.rotation;
	rigidbody.velocity = rigidbody.angularVelocity = Vector3.zero;
	GameObject.Find("LapCollider").GetComponent(LapTime_Script).Start();
	
	// set the NeuralNetwork weights by copying them from current chromosome
	brainComponent.brain.SetTotalWeights( 
		geneticComponent.population.GetCurrentChromosome().GetWeights()
	);
	
	// reset the fitness value and other status variables
	geneticComponent.population.ResetCurrentCromosomeFitness();
	totFrames = 0;
	totSpeed = 0;
	avgSpeed = 0;
	totDistance = 0;
	lastPosition = transform.position;
	
	Invoke("checkMoving", 5); // Check if the car is moving after the first 5 seconds
}

function Start () {
	// I usually alter the center of mass to make the car more stable. I'ts less likely to flip this way.
	rigidbody.centerOfMass.y = -1.5;
	
	brainComponent = GameObject.Find("Brain").GetComponent(NeuralNet_Script);
	brainComponent.brain = new NeuralNetwork();
	
	geneticComponent = GameObject.Find("Brain").GetComponent(GeneticAlgorithm_Script);
	geneticComponent.population = new Population(20, brainComponent.brain.GetTotalWeights().length);
	geneticComponent.population.InitRandomChromosomes();
	
	rayComponent = GameObject.Find("RayTracing").GetComponent(RayCalc_Script);
	
	startSimulation();
}

/* */
function updateFitness () {
	// for now it's a very basic increment, but in future there will be
	// more checks on curve type and distance to internal wall...
	var currentFitness : int;
	
	currentFitness = Mathf.RoundToInt(totDistance * avgSpeed);
	geneticComponent.population.SetCurrentCromosomeFitness(currentFitness);
}

function FixedUpdate () {
	// This is to limith the maximum speed of the car, adjusting the drag probably isn't the best way of doing it,
	// but it's easy, and it doesn't interfere with the physics processing.
	rigidbody.drag = rigidbody.velocity.magnitude / 250;
	
	// Compute the engine RPM based on the average RPM of the two wheels, then call the shift gear function
	EngineRPM = (FrontLeftWheel.rpm + FrontRightWheel.rpm)/2 * GearRatio[CurrentGear];
	ShiftGears();
	
	var inputs : float[] = new float[parseInt(NN_INPUT.COUNT)];
	inputs[parseInt(NN_INPUT.SPEED)] = (rigidbody.velocity.magnitude >= 0.1f ? rigidbody.velocity.magnitude : 0.0f);
	inputs[parseInt(NN_INPUT.FRONT_COLLISION_DIST)] = rayComponent.frontCollisionDist;
	inputs[parseInt(NN_INPUT.LEFT_COLLISION_DIST)] = rayComponent.leftCollisionDist;
	inputs[parseInt(NN_INPUT.RIGHT_COLLISION_DIST)] = rayComponent.rightCollisionDist;
	inputs[parseInt(NN_INPUT.TURN_ANGLE)] = rayComponent.turnAngle;
	
	brainComponent.brain.SetInputs(inputs);
	brainComponent.brain.Update();
	
	var outputs : float[] = brainComponent.brain.GetOutputs();
	FrontLeftWheel.motorTorque = FrontRightWheel.motorTorque = EngineTorque / GearRatio[CurrentGear] * outputs[parseInt(NN_OUTPUT.ACCELERATION)];
	FrontLeftWheel.steerAngle = FrontRightWheel.steerAngle = 20 * (outputs[parseInt(NN_OUTPUT.STEERING_FORCE)]*2-1);

	totDistance += Vector3.Distance(transform.position, lastPosition); 
	lastPosition = transform.position;
	totSpeed += Mathf.RoundToInt(rigidbody.velocity.magnitude);
	avgSpeed = totSpeed / ++totFrames;
	
	// update the fitness value
	updateFitness();
	
	
    if (Input.GetKeyDown ("space"))	{
    	var data : byte[] = geneticComponent.population.save();
    	var path = ".";
    	var  newPath = System.IO.Path.Combine(path, "savedPopulations");
    	 // Create the subfolder
        System.IO.Directory.CreateDirectory(newPath);

        // Create a new file name. This example generates// a random string.
        var newFileName = "population"+DateTime.Now.ToString("yyyy_MM_dd-HH_mm")+".pop";

        // Combine the new file name with the path
        newPath = System.IO.Path.Combine(newPath, newFileName);

        // Create the file and write to it.
        // DANGER: System.IO.File.Create will overwrite the file if it already exists. This can occur even with// random file names.
        if (!System.IO.File.Exists(newPath))
        {
            var fs = System.IO.File.Create(newPath);
            for (var i = 0; i < data.length; i++)
                {
                    fs.WriteByte(data[i]);
                }
        }
        
    }
}

/*	This function checks if the car has made a distance higher that 5.
	If not, this simulation restarts */
function checkMoving() {
	if (totDistance < 5) {
		restartSimulation();
	}
}

/*	this funciton shifts the gears of the vehcile, it loops through all the gears, checking which will make
	the engine RPM fall within the desired range. The gear is then set to this "appropriate" value. */
function ShiftGears() {
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

/*	if the car collides (with a wall), we save the fitness of current chromosome 
	and restart the simulation */
function OnCollisionStay(collision : Collision) {
	for (var contact : ContactPoint in collision.contacts) {
        if (contact.normal != Vector3.up)	{
        	restartSimulation();
        	break;
        }
    }
}


/*	reset simulation, but with new chromosomes */
function restartSimulation() {
	
	Debug.Log("Current chromosome: " + geneticComponent.population.GetCurrentChromosomeID() 
		+ " with fitness " + geneticComponent.population.GetCurrentCromosomeFitness()
		+ " and avgSpeed " + avgSpeed);
	
	// go throught next chromosome
	geneticComponent.population.SetNextChromosome();
	
	if(geneticComponent.population.IsLastChromosome())	{
		// tried all the chromosomes, start a new generation.
		Debug.Log("Generation tested, start new one");
		geneticComponent.population.NewGeneration();
	}
	
	startSimulation();
}

/* Print some statistics during each run */
function OnGUI () {
	var boxWidth = 180;
	GUI.Box (Rect (Screen.width-boxWidth, 0, boxWidth,  Screen.height), "STATS");
	GUI.Label (Rect (Screen.width-boxWidth + 10, 100, boxWidth - 10, 20), "Speed : " + Mathf.RoundToInt(rigidbody.velocity.magnitude));
	GUI.Label (Rect (Screen.width-boxWidth + 10, 120, boxWidth - 10, 20), "Med.Speed : " + avgSpeed);
	GUI.Label (Rect (Screen.width-boxWidth + 10, 140, boxWidth - 10, 20), "Distance : " + totDistance);
}
