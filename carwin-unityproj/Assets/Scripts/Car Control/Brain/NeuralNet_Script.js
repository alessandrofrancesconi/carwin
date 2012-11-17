#pragma strict

public var brain : NeuralNetwork;

public enum NN_INPUT { 
	SPEED = 0, // current speed of the car
	FRONT_COLLISION_DIST, // distance from the nearest front collision point (taken from RayTracing method)
	LEFT_COLLISION_DIST,
	RIGHT_COLLISION_DIST,
	TURN_ANGLE, // angle of the imminent curve (taken from RayTracing method), from -90 to 90
	BIAS, // The bias will act as a threshold value, it's fixed to -1.0f
	
	COUNT
};

public enum NN_OUTPUT { 
	STEERING_FORCE = 0, 
	ACCELERATION,
	
	COUNT
};

public class NeuralNetwork {
	var inputs : float[];
	var inputLayer : NN_Layer;
	var hiddenLayers : NN_Layer[]; // hidden layers
	var outputs : float[];
	var outputLayer : NN_Layer;
	
	// build and initialize the entire neural network
	function NeuralNetwork() {
		var HIDDEN_LAYERS_COUNT : int = 1; // 1 hidden layer is enough...
		var NEURONS_PER_HIDDEN : int = 8; // # neurons in each hidden layer
		
		this.inputs = new float[parseInt(NN_INPUT.COUNT)];
		
		this.hiddenLayers = new NN_Layer[HIDDEN_LAYERS_COUNT]; 
		for (layer in hiddenLayers) {
			layer = new NN_Layer(NEURONS_PER_HIDDEN, parseInt(NN_INPUT.COUNT)); 
		}
		
		this.outputs = new float[parseInt(NN_OUTPUT.COUNT)];
		this.outputLayer = new NN_Layer(parseInt(NN_OUTPUT.COUNT), NEURONS_PER_HIDDEN);
	}
	
	public function Update() {
		this.outputs = new float[parseInt(NN_OUTPUT.COUNT)]; // clear outputs
		
		var i : int = 0;
		for (layer in this.hiddenLayers) {
			if (i > 0) this.inputs = this.outputs;
			this.outputs = layer.Evaluate(this.inputs);
			i++;
		}
		
		this.inputs = this.outputs;
		// Process the output through the output layer to 
		this.outputs = this.outputLayer.Evaluate(this.inputs);
	}
	
	public function SetInputs(inputs : float[]) {
		this.inputs = new float[NN_INPUT.COUNT];
		this.inputs[parseInt(NN_INPUT.SPEED)] = inputs[parseInt(NN_INPUT.SPEED)];
		this.inputs[parseInt(NN_INPUT.FRONT_COLLISION_DIST)] = inputs[parseInt(NN_INPUT.FRONT_COLLISION_DIST)];
		this.inputs[parseInt(NN_INPUT.LEFT_COLLISION_DIST)] = inputs[parseInt(NN_INPUT.LEFT_COLLISION_DIST)];
		this.inputs[parseInt(NN_INPUT.RIGHT_COLLISION_DIST)] = inputs[parseInt(NN_INPUT.RIGHT_COLLISION_DIST)];
		this.inputs[parseInt(NN_INPUT.TURN_ANGLE)] = inputs[parseInt(NN_INPUT.TURN_ANGLE)];
		this.inputs[parseInt(NN_INPUT.BIAS)] = -1.0f;
	}
	
	public function GetOutputs() {
		return this.outputs;
	}
	
	/* Returns an array of all weights from hidden and output layers */
	public function GetTotalWeights() : float[] {
		var totWeights = new Array();
		
		// Take weights from middle neurons
		for (layer in this.hiddenLayers) {
			for (neuron in layer.GetNeurons()) {
				for (weight in neuron.GetWeights()) {
					totWeights.Push(weight);
				}
			}
		}
		
		// Take weights from output neurons
		for (neuron in this.outputLayer.GetNeurons()) {
			for (weight in neuron.GetWeights()) {
				totWeights.Push(weight);
			}
		}
		
		// dynamic array to builtin output array
		var output : float[] = new float[totWeights.length];
		var j : int;
		for (j = 0; j < totWeights.length; j++) output[j] = totWeights[j];
		
		return output;
	}
	
	public function SetTotalWeights(weights : float[]) {
		var i : int = 0;
		
		for (layer in this.hiddenLayers) {
			for (neuron in layer.GetNeurons()) {
				for (weight in neuron.GetWeights()) {
					weight = weights[i];
					i++;
				}
			}
		}
		
		for (neuron in this.outputLayer.GetNeurons()) {
			for (weight in neuron.GetWeights()) {
				weight = weights[i];
				i++;
			}
		}
	}
	
	
	
	class NN_Layer {
		var neurons : NN_Neuron[];
		
		function NN_Layer(neuronsCount : int, inputCount : int) {
			this.neurons = new NN_Neuron[neuronsCount];
			for (neuron in this.neurons) {
				neuron = new NN_Neuron(inputCount);
			}
		}
		
		public function Evaluate(input : float[]) {
			var dynOutput = new Array();
			
			// Cycle over all the neurons and sum their weights against the inputs.
			for (neuron in this.neurons) {
				var activation : float = 0.0f;
				
				var weights : float[] = neuron.GetWeights();
				
				var i : int;
				for (i = 0; i < input.length; i++) {
					activation += input[i] * weights[i];
				}

				// calc the sigmoid value
				var sig : float = 1 / (1 + Mathf.Exp(-activation));
				// and push it on outputs (dynamic array)
				dynOutput.Push(sig);
			}
			
			// dynamic array to builtin output array
			var output : float[] = new float[dynOutput.length];
			var j : int;
			for (j = 0; j < dynOutput.length; j++) output[j] = dynOutput[j];
			
			return output;
		}
		
		public function GetNeurons() : NN_Neuron[] {
			return this.neurons;
		}
		
		
		// a neuron is a structure composed by input datas and relative weights
		class NN_Neuron {
			private var inputs : float[];
			private var weights : float[];
			
			function NN_Neuron(inputCount : int) {
				this.inputs = new float[inputCount];
				// populate weights randomly
				this.weights = new float[inputCount];
			}
			
			public function SetInputs(inputs : float[]) {
				this.inputs = inputs;
			}
			
			public function GetInputs() {
				return this.inputs;
			}
			
			public function GetWeights() {
				return this.weights;
			}
			
			public function SetWeights(weights : float[]) {
				this.weights = weights;
			}
		}
	}
}


function Start () {}

function Update () {}