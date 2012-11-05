#pragma strict

private enum NN_InputEnum { 
	SPEED, // current speed of the car
	FRONT_COLLISION_DIST, // distance from the nearest collision point (taken from RayTracing method)
	TURN_TYPE, // right, left or straight?
	BIAS,
	
	NN_INPUT_COUNT
};

private enum NN_OutputEnum { 
	STEERING_FORCE, 
	ACCELERATION,
	
	NN_OUTPUT_COUNT
};

// a neuron is a structure composed by input datas and relative weights
class NN_Neuron {
	private var inputs : float[];
	private var weights : float[];
	
	public function NN_Neuron(inputCount : int) {
		// init weights randomly
		this.weights = new float[inputCount];
		for (weight in weights) {
			weight = Random.Range(-1.0, 1.0);
		}
	}
	
	public function SetInputs(inputs : float[]) {
		this.inputs = inputs;
	}	
}

class NN_Layer {
	var totOutputs : int;
	var neurons : NN_Neuron[];
	
	public function NN_Layer(neuronsCount : int, inputCount : int) {
		neurons = new NN_Neuron[neuronsCount];
		for (neuron in neurons) {
			neuron = new NN_Neuron(inputCount);
		}
	}
}

public class NeuralNetwork
{
	var input : float[];
	var inputLayer : NN_Layer;
	var hiddenLayers : NN_Layer[]; // hidden layers
	var output : float[];
	var outputLayer : NN_Layer;
	
	// build and initialize the entire neural network
	public function NeuralNetwork() {
		var NEURONS_PER_HIDDEN : int = 8;
		
		input = new float[NN_InputEnum.NN_INPUT_COUNT];
		
		hiddenLayers = new NN_Layer[NN_OutputEnum.NN_OUTPUT_COUNT];
		for (layer in hiddenLayers) {
			layer = new NN_Layer(NEURONS_PER_HIDDEN, NN_InputEnum.NN_INPUT_COUNT); // # neurons in each hidden layer
		}
		
		output = new float[NN_OutputEnum.NN_OUTPUT_COUNT];
		outputLayer = new NN_Layer(NN_OutputEnum.NN_OUTPUT_COUNT, NEURONS_PER_HIDDEN);
	}
	
	public function Update() {
		this.output = [];
		// .....
	}
	
	public function SetInput(input : float[]) {
		this.input[NN_InputEnum.SPEED] = input[NN_InputEnum.SPEED];
		this.input[NN_InputEnum.FRONT_COLLISION_DIST] = input[NN_InputEnum.FRONT_COLLISION_DIST];
		this.input[NN_InputEnum.TURN_TYPE] = input[NN_InputEnum.TURN_TYPE];
		this.input[NN_InputEnum.BIAS] = -1.0f;
	}
	
	public function GetOutput() {
		return this.output;
	}
	
}


function Start () {
	var brain = new NeuralNetwork();
}

function Update () {

}