/* 
	CARWIN - A self-driving car implemented with neural networks and genetic algorithms 
	by Buzzoni Marco and Francesconi Alessandro - University of Bologna 2012
	http://www.github.com/alessandrofrancesconi/carwin
	
	
	The original car's model and movement system was made by 
	Ansetfdrew Gotow - maxwelldoggums@gmail.com
	http://www.gotow.net/andrew/blog/?page_id=78 (2009)
	
	Neural Network with Genetic Algorithm implementation is based on two main resources:
	http://www.ai-junkie.com/ann/evolved/nnt1.html
	http://www.obitko.com/tutorials/genetic-algorithms/index.php
*/

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
var EngineTorque : float = 600.0;
var MaxEngineRPM : float = 3000.0;
var MinEngineRPM : float = 1000.0;
private var EngineRPM : float = 0.0;

// These variables are three precious components for the car self-driving system:
private var brainComponent : Component; // Contains the neural network data structure
private var geneticComponent : Component; // Contains the genetic algorithm data structure
private var rayComponent : Component; // Contains the collection of rays casted from the car

private var startPoint : GameObject; // This will store the startPoint of the active track

public var inputs : float[]; // Input vector, built every frame, that will be transmitted to the neural network
private var avgSpeed : float; // average driving speed
private var totDistance : float; // the distance made by the car
private var lastPosition : Vector3; // the position of the car in the current frame
private var totFrames : int; // frames passed from the simulation start (used for avgSpeed)
private var totSpeed : int; // (used for avgSpeed)

function Start () {
	// Alter the center of mass to make the car more stable. I'ts less likely to flip this way.
	rigidbody.centerOfMass.y = -1.5;
	
	startPoint = GameObject.Find("StartPoint"); // get the startPoint of the active track
	
	// initialize all the main components
	
	brainComponent = GameObject.Find("Brain").GetComponent(NeuralNet_Script);
	brainComponent.brain = new NeuralNetwork();
	
	geneticComponent = GameObject.Find("Brain").GetComponent(GeneticAlgorithm_Script);
	// we create a population of 14 chromosomes, each one with the total number of weights of the neural network
	geneticComponent.population = new Population(14, brainComponent.brain.GetTotalWeights().length);
	
	rayComponent = GameObject.Find("RayTracing").GetComponent(RayCalc_Script);
	
	startSimulation();
}

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
	totFrames = 0;
	totSpeed = 0;
	avgSpeed = 0;
	totDistance = 0;
	lastPosition = transform.position;
	
	Invoke("checkMoving", 5); // Check if the car is moving after the first 5 seconds
}

/* the fitness update can be a very basic increment, or a more advanced operation.
	for now we consider both actual distance and average speed, but in future there can be
	more checks, e.g. on curve type and distance to internal wall (this will probably make the 
	car drive "better", but will also increase the overall complexity of the neural network) */
function updateFitness () {	
	var currentFitness : int;
	
	currentFitness = Mathf.RoundToInt(totDistance * avgSpeed);
	//currentFitness = Mathf.RoundToInt(totDistance*3 + avgSpeed*2);
	geneticComponent.population.SetCurrentCromosomeFitness(currentFitness);
}

function FixedUpdate () {
	// This is to limith the maximum speed of the car, adjusting the drag probably isn't the best way of doing it,
	// but it's easy, and it doesn't interfere with the physics processing.
	rigidbody.drag = rigidbody.velocity.magnitude / 50;
	
	// Compute the engine RPM based on the average RPM of the two wheels, then call the shift gear function
	EngineRPM = (FrontLeftWheel.rpm + FrontRightWheel.rpm)/2 * GearRatio[CurrentGear];
	ShiftGears();
	
	rayComponent.CalcCollisions(); // force rays to calc all the collisions now
	
	// fill the input vector with the actual informations coming from the car's sensors
	inputs = new float[parseInt(NN_INPUT.COUNT)];
	inputs[parseInt(NN_INPUT.SPEED)] = Mathf.RoundToInt(rigidbody.velocity.magnitude)+1; 
	inputs[parseInt(NN_INPUT.FRONT_COLLISION_DIST)] = rayComponent.frontCollisionDist;
	inputs[parseInt(NN_INPUT.LEFT_COLLISION_DIST)] = rayComponent.leftCollisionDist;
	inputs[parseInt(NN_INPUT.RIGHT_COLLISION_DIST)] = rayComponent.rightCollisionDist;
	inputs[parseInt(NN_INPUT.TURN_ANGLE)] = rayComponent.turnAngle;
	
	brainComponent.brain.SetInputs(inputs); // pass the inputs to the neural network
	brainComponent.brain.Update(); // brain start thinking....
	
	var outputs : float[] = brainComponent.brain.GetOutputs(); // ... and we have outputs!
	// set the acceleration factor (from 0.0 to 1.0)
	FrontLeftWheel.motorTorque = FrontRightWheel.motorTorque = EngineTorque / GearRatio[CurrentGear] * outputs[parseInt(NN_OUTPUT.ACCELERATION)];
	// and steering (from -1.0 (left) to 1.0 (right)) - multiply it by 15 to make tighter turns
	// also, we do <force>*2-1 because the original value goes from 0.0 to 1.0
	FrontLeftWheel.steerAngle = FrontRightWheel.steerAngle = 15 * (outputs[parseInt(NN_OUTPUT.STEERING_FORCE)]*2-1);

	// update distance made and avg speed
	totDistance += Vector3.Distance(transform.position, lastPosition); 
	lastPosition = transform.position;
	totSpeed += Mathf.RoundToInt(rigidbody.velocity.magnitude);
	avgSpeed = totSpeed / ++totFrames;
	
	// update the fitness value
	updateFitness();
	
	// when the user presses SPACE, the current population is saved in an external file
    if (Input.GetKeyDown ("space"))	{
    	var data : byte[] = geneticComponent.population.save();
    	var path = ".";
    	var  newPath = System.IO.Path.Combine(path, "savedPopulations");
    	// Create the subfolder
        System.IO.Directory.CreateDirectory(newPath);
		
        var newFileName = "population"+DateTime.Now.ToString("yyyyMMddHHmm")+".pop";

        // Combine the new file name with the path
        newPath = System.IO.Path.Combine(newPath, newFileName);

        // Create the file and write to it.
        if (!System.IO.File.Exists(newPath))
        {
            var fs = System.IO.File.Create(newPath);
            for (var i = 0; i < data.length; i++) {
				fs.WriteByte(data[i]);
			}
        }
    }
}

/*	This function checks if the car is moving with an acceptable avg speed.
	If not, this simulation restarts. We don't need slow cars! */
function checkMoving() {
	if (avgSpeed < 3) {
		restartSimulation();
	}
}

/*	this function shifts the gears of the vehcile, it loops through all the gears, checking which will make
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
	// for now the fitness mode is always set to STRICT, that mean that the simulation restarts on EVERY KIND of 
	// collision. With a lazy mode, instead, we could ignore some "light" collisions and continue
	if (geneticComponent.ga_FitnessMode == parseInt(GA_FITNESS_MODE.STRICT)) {
		for (var contact : ContactPoint in collision.contacts) {
			if (contact.normal != Vector3.up)	{
				restartSimulation();
				break;
			}
		}
	}
}

/*	reset simulation, but with new chromosomes */
function restartSimulation() {
	
	Debug.Log("Current chromosome: " + geneticComponent.population.GetCurrentChromosomeID() 
		+ " with fitness " + geneticComponent.population.GetCurrentCromosomeFitness());
	
	// go throught the next chromosome
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
	GUI.Label (Rect (Screen.width-boxWidth + 10, 80, boxWidth - 10, 20), "Speed : " + Mathf.RoundToInt(rigidbody.velocity.magnitude));
	GUI.Label (Rect (Screen.width-boxWidth + 10, 100, boxWidth - 10, 20), "Avg.Speed : " + avgSpeed);
	GUI.Label (Rect (Screen.width-boxWidth + 10, 120, boxWidth - 10, 20), "Distance : " + totDistance);
	GUI.Label (Rect (Screen.width-boxWidth + 10, 160, boxWidth - 10, 20), "Best fitness: " + geneticComponent.population.bestFitness);
	GUI.Label (Rect (Screen.width-boxWidth + 10, 180, boxWidth - 10, 20), "in generation: " + (geneticComponent.population.bestPopulation+1) + " of " + (geneticComponent.population.currentPopulation+1));
	
	/*GUI.Label (Rect (Screen.width-boxWidth + 10, 140, boxWidth - 10, 20), "Weights: ");
	var space = 0;
	for (weight in geneticComponent.population.GetCurrentChromosome().GetWeights())
	{
		GUI.Label (Rect (Screen.width-boxWidth + 10, 160 + space, boxWidth - 10, 20), " " + 
			weight);
		space += 20;
	}*/
	
}
