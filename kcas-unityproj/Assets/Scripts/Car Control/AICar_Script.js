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

public var currentChromosome : int;
public var currentFitness : int;
public var startPoint : GameObject;

/*
This function:
- starts a simulation
- update the fitnes of current chromosome at the end of the simulation (on collision event)
- if we have finished chromosome, do crossover etc...
*/
function Simulation()	{
	// - starts a simulation
	// puts the car in the correct start point
	transform.position = startPoint.transform.position;
	transform.rotation = startPoint.transform.rotation;
	rigidbody.velocity = rigidbody.angularVelocity = Vector3.zero;
	GameObject.Find("LapCollider").GetComponent(LapTime_Script).Start();
	
	// sets the current chromosome as weights of the NN
	brainComponent.brain.SetTotalWeights( 
		geneticComponent.population.GetChromosomes()[currentChromosome].GetWeights()
	);
	
	// reset the fitness value
	currentFitness = 0;	
}

function Start () {
	// I usually alter the center of mass to make the car more stable. I'ts less likely to flip this way.
	rigidbody.centerOfMass.y = -1.5;
	
	brainComponent = GameObject.Find("Brain").GetComponent(NeuralNet_Script);
	brainComponent.brain = new NeuralNetwork();
	
	currentChromosome = 0;	// start from first chromosome.
	
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
	
	//FrontLeftWheel.motorTorque = FrontRightWheel.motorTorque = EngineTorque / GearRatio[CurrentGear] * Input.GetAxis("Vertical");
	//FrontLeftWheel.steerAngle = FrontRightWheel.steerAngle = 10 * Input.GetAxis("Horizontal");
	
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
	
	// update the fitness value
	updateFitness();
}

function updateFitness() {
	// for now it's a very basic increment, but in future there will be
	// more checks on curve type and distance to internal wall...
	currentFitness ++;
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
        	//Debug.Log("Collisione con " + contact.normal);
        	Debug.Log("Cromosoma corrente " + currentChromosome);
        	// reset simulation, but with new chromosome
    		geneticComponent.population.chromosomes[currentChromosome].SetFitness(currentFitness);
    		
        	currentChromosome ++;
        	
        	// tried all the chromosomes, start a new generation.
        	if(currentChromosome == geneticComponent.population.GetChromosomes().length)	{
        		Debug.Log("Generation tested");
        		currentChromosome = 0;
        	}
        	
        	Simulation();
        	break;
        }
    }
}

function CrossOver(): Population.Chromosome[] {
	var totWeights : int = geneticComponent.population.GetChromosomes()[0].GetWeights().length;
	var toCross : int = Random.Range(0, totWeights - 2);
	
	var chromosome1:int = RouletteWheel();
	var chromosome2:int = RouletteWheel();
	
	// create 2 new chromosomes from the selected ones
	var newChromosome1 = geneticComponent.population.GetChromosomes()[chromosome1];
	var newChromosome2 = geneticComponent.population.GetChromosomes()[chromosome2];
	
	var weightsTMP1: float[] = new float[totWeights];
	var weightsTMP2: float[] = new float[totWeights];
	for (i=0; i < totWeights; i++)	{
		if (i <= toCross)	{
			weightsTMP1[i] = newChromosome1.GetWeights()[i];
			weightsTMP2[i] = newChromosome2.GetWeights()[i];
		}	else{
			weightsTMP1[i] = newChromosome2.GetWeights()[i];
			weightsTMP2[i] = newChromosome1.GetWeights()[i];
		}
	}
	
	var chromPair: Population.Chromosome[] = new Population.Chromosome[2];
	chromPair[0] = new Population.Chromosome( totWeights );
	chromPair[0].SetWeights(weightsTMP1);
	chromPair[1] = new Population.Chromosome( totWeights );
	chromPair[1].SetWeights(weightsTMP2);
	return chromPair;
}

/*
    [Sum] Calculate sum of all chromosome fitnesses in population - sum S.
    [Select] Generate random number from interval (0,S) - r.
    [Loop] Go through the population and sum fitnesses from 0 - sum s. 
    When the sum s is greater then r, stop and return the chromosome where you are. 
*/
function RouletteWheel() : int {
	var fitnessSum : int = 0;
	var randomNum : int;
	var selectedChrom : int = 0;
	
	for(chromosome in geneticComponent.population.GetChromosomes()) {
		fitnessSum += chromosome.GetFitness();
	}
	
	randomNum = Mathf.RoundToInt(Random.Range(0, fitnessSum));
	fitnessSum = 0;
	for(chromosome in geneticComponent.population.GetChromosomes()) {
		fitnessSum += chromosome.GetFitness();
		if (fitnessSum > randomNum) {
			return selectedChrom;
		}
		else {
			selectedChrom++;
		}
	}
	
	return selectedChrom;
}
