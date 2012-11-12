#pragma strict

public var population : Population;



/*
This is a set of chromosomes, and this is sorted (chromosomes with higher fitness
is the firsts, chromosomes with lower fitness is the lasts.
*/
public class Population	{
	private var chromosomes : Chromosome[];
	
	/*
	Create a population of cCount chromosomes, each one of wCount elements (weights).
	*/
	function Population(cCount : int, wCount : int)	{
		this.chromosomes = new Chromosome[cCount];
		
		for(chromosome in this.chromosomes) {
			chromosome = new Chromosome(wCount);
		}
		
	}
	
	/*
	Fill the population with random generated chromosomes,
	only the first time.
	*/
	function InitRandomChromosomes()	{
		for(chromosome in this.chromosomes) {
			for (weight in chromosome.GetWeights())	{
				weight = Random.Range(-2.0, 2.0);
			}
		}
	}
	
	function GetChromosomes() : Chromosome[] {
		return this.chromosomes;
	}
	
	/*
	This element is an array of weights of the neural network.
	Adjusting weights means adjusting the output of the NN
	*/
	public class Chromosome	{
		private var fitness:int;
		private var weights:float[];
		
		function Chromosome(wCount : int) {
			this.fitness = 0.0f;
			this.weights = new float[wCount];
		}
		
		/* 
		This function return the fitness of a chromosome.
		Higher fitness means highest probability to be selected for crossover.
		*/
		public function SetFitness(f:int)	{
			this.fitness = f;
		}
		public function GetFitness():int	{
			return this.fitness;
		}
		
		public function SetWeights(w:float[])	{
			this.weights = w;
		}
		public function GetWeights():float[]	{
			return this.weights;
		}
	}
}

/*
Initializes the algorithm.
*/
function Start () {}

function Update () {}