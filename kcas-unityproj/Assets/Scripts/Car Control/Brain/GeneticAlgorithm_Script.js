#pragma strict

public var population : Population;



/*
This is a set of chromosomes, and this is sorted (chromosomes with higher fitness
is the firsts, chromosomes with lower fitness is the lasts.
*/
public class Population	{
	private var chromosomes : Chromosome[];
	private var currentFitness : int;
	private var currentChromosome : int;
	
	/*
	Create a population of cCount chromosomes, each one of wCount elements (weights).
	*/
	function Population(cCount : int, wCount : int)	{
		this.chromosomes = new Chromosome[cCount];
		
		for(chromosome in this.chromosomes) {
			chromosome = new Chromosome(wCount);
		}
		
		this.currentChromosome = 0;
		this.currentFitness = 0;
	}
	
	/*
	Create a new population according to the fitness of the old chromosomes.
	*/
	function NewGeneration()	{
		this.ResetCurrentChromosome();
		var newChromosomes : Chromosome[] = new Chromosome[this.chromosomes.length];
		var crossOverRate : float = 0.7;
		for(var i = 0; i < chromosomes.length; i++)
		{
			// TODO: perform a mutation 0.5% of times
			// generate a crossover with probability 70%
			if(Random.value <= crossOverRate)	{
				var chromosomePair : Chromosome[] = this.CrossOver();
				newChromosomes[i] = chromosomePair[0];
				
				i++;
				if ( i < chromosomes.length)
					newChromosomes[i] = chromosomePair[1];
			}	else	{
				// copy an old chromosome with probability 30%
				var chromToCopy = this.RouletteWheel();
				newChromosomes[i] = this.chromosomes[chromToCopy];
				/*if(Random.value <= crossOverRate)	{
					newChromosomes[i] = 
				}*/
			}
		}
		
		// TODO add mutation at rate 0.5%
		
		this.chromosomes = newChromosomes;
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
	
	function GetCurrentChromosome() : Chromosome {
		return this.chromosomes[this.currentChromosome];
	}
	
	function GetCurrentChromosomeID() : int {
		return this.currentChromosome;
	}
	
	function IsLastChromosome() : boolean {
		return (this.currentChromosome == this.chromosomes.length);
	}
	
	function ResetCurrentChromosome() {
		this.currentChromosome = 0;
	}
	
	function SetNextChromosome() {
		this.currentChromosome ++;
	}
	
	// for now it's a very basic increment, but in future there will be
	// more checks on curve type and distance to internal wall...
	function UpdateFitness() {
		this.currentFitness++;
	}
	
	function ResetFitness() {
		this.currentFitness = 0;
	}
	
	function GetCurrentFitness() : int {
		return this.currentFitness;
	}
	
	function GetCurrentCromosomeFitness() : int {
		return this.chromosomes[this.currentChromosome].GetFitness();
	}
	
	function SetCurrentCromosomeFitness() {
		this.chromosomes[this.currentChromosome].SetFitness(this.currentFitness);
	}
	
	function SetCurrentCromosomeFitness(fit : int) {
		this.chromosomes[this.currentChromosome].SetFitness(fit);
	}
	
	/*
	Perform a random mutation of a chromosome.
	*/
	function mutate(chromosome : Chromosome) : Chromosome	{
		var weightToMutate : int = Mathf.RoundToInt( Random.value * chromosome.GetWeights().length);
		var w : float[] = chromosome.GetWeights();
		w[weightToMutate] += Random.value * 0.002 - 0.001;
		chromosome.SetWeights(w);
		
		return chromosome;
	}
	
	/*
	Does the crossovr between between 2 chromosomes.
	*/
	function CrossOver(): Chromosome[] {
		var totWeights : int = this.chromosomes[0].GetWeights().length;
		var toCross : int = Random.Range(0, totWeights - 2);
		
		var chromosome1 : int = this.RouletteWheel();
		var chromosome2 : int = this.RouletteWheel();
		
		// create 2 new chromosomes from the selected ones
		var newChromosome1 = this.chromosomes[chromosome1];
		var newChromosome2 = this.chromosomes[chromosome2];
		
		var weightsTMP1 : float[] = new float[totWeights];
		var weightsTMP2 : float[] = new float[totWeights];
		for (var i = 0; i < totWeights; i++)	{
			if (i <= toCross)	{
				weightsTMP1[i] = newChromosome1.GetWeights()[i];
				weightsTMP2[i] = newChromosome2.GetWeights()[i];
			}	else {
				weightsTMP1[i] = newChromosome2.GetWeights()[i];
				weightsTMP2[i] = newChromosome1.GetWeights()[i];
			}
		}
		
		var chromPair : Chromosome[] = new Chromosome[2];
		chromPair[0] = new Chromosome( totWeights );
		chromPair[0].SetWeights(weightsTMP1);
		chromPair[1] = new Chromosome( totWeights );
		chromPair[1].SetWeights(weightsTMP2);
		
		return chromPair;
	}
		
	/*
	    [Sum] Calculate sum of all chromosome fitnesses in population - sum S.
	    [Select] Generate random number from interval (0,S) - r.
	    [Loop] Go through the population and sum fitnesses from 0 - sum s. 
	    When the sum s is greater then r, stop and return the chromosome where you are. 
	*/
	private function RouletteWheel() : int {
		var fitnessSum : int = 0;
		var randomNum : int;
		var selectedChrom : int = 0;
		
		for(chromosome in this.chromosomes) {
			fitnessSum += chromosome.GetFitness();
		}
		
		randomNum = Mathf.RoundToInt(Random.Range(0, fitnessSum));
		fitnessSum = 0;
		for(chromosome in this.chromosomes) {
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