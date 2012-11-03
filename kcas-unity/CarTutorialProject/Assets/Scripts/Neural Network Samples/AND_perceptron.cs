using UnityEngine;
using System.Collections;

public class AND_perceptron : MonoBehaviour {
	
	/*
	 * P = set of vector which must obtain a positive result.
	 * N = set of vectors which must obtain a negative result.
	 * 
	 * if x is a vector belonging to P, w is a vector of weight
	 * and THETA is threshold:
	 * x * w > THETA
	 * analog case if x belongs to N.
	 * 
	 * instead of the above expression we add a third element to x which is 1 and a third element to w which is -TòHETA
	 * and we use 0 instead of THETA in the right of the expression.
	 */
	private Vector3[] P, N;
	private Vector3 w;
	private const float THETA = 1;
	
	private bool nonCorretto;

	// Use this for initialization
	void Start () {
		
		nonCorretto = true;
		
		/* for building the AND logical function is used only one perceptron.
		 * here I use a binary AND. */
		P = new Vector3[1];
		N = new Vector3[3];
		
		// let's populate the 2 sets P and N with respective values
		P[0] = new Vector3(1, 1, 1);
		
		N[0] = new Vector3(0, 0, 1);
		N[1] = new Vector3(0, 1, 1);
		N[2] = new Vector3(1, 0, 1);
		
		Debug.Log("Created sets.");
		
		w = new Vector3(Random.value, Random.value, -THETA);
		Debug.Log("Generated initial weights. " + w);
		
		Vector3 tmp = Vector3.zero;
		
		while (nonCorretto)	{
			
			nonCorretto = false;
			// we now adjust the weights every time one of the condition of the AND is not respected.
			for (int i=0; i < P.Length; i++)	{
				// x * w > 0? if yes it's correct
				tmp = Vector3.Scale(P[i], w);
				Debug.Log((tmp.x + tmp.y + tmp.z) + " <= 0?");
				if( (tmp.x + tmp.y + tmp.z) <= 0 ) {
					// otherwise we must add x to w to rotate it towards the solution region.
					w = w + P[i];
					nonCorretto = true;
				}
				Debug.Log("New w is " + w);
			}
			
			for (int i=0; i < N.Length; i++)	{
				// x * w < 0? if yes it's correct
				tmp = Vector3.Scale(N[i], w);
				Debug.Log((tmp.x + tmp.y + tmp.z) + " >= 0?");
				if( (tmp.x + tmp.y + tmp.z) >= 0 ) {
					// otherwise we must add x to w to rotate it towards the solution region.
					w = w - N[i];
					nonCorretto = true;
				}
				Debug.Log("New w is " + w);
			}
		}
		
		Debug.Log("The computed weights are " + w);
		Debug.Log("REMEMBER: the third parameter of w is about THETA, not the argument. the AND is binary. " + w);
		Debug.Log("Said that, it works! :) ");
	}
	
	void Update () {
	
	}
}
