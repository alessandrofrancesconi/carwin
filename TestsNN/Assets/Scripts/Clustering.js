#pragma strict

private var input : Array;
private var inputVec : Array;
private var w:Array;


function Start () {
	
	input = new Array();
	inputVec = new Array();
	
	createVector(0.12);
	createVector(0.32);
	createVector(1.44);
	createVector(2.89);
	createVector(3.14);
	
	
	/*
	L'insieme di vettori di input X è inputVec. (pag 112 libro)
	scelgo il numero di cluster k=2, e genero a caso 2 pesi.
	*/
	w = new Array();
	
	var x = Random.value * Mathf.PI;
	var tmp:Vector2;
	tmp = new Vector2(Mathf.Sin(x), Mathf.Cos(x));
	tmp.Normalize();
	w.Push( tmp );
	
	x = Random.value * Mathf.PI;
	tmp = new Vector2(Mathf.Sin(x), Mathf.Cos(x));
	tmp.Normalize();
	w.Push( tmp );
	
	x = Random.value * Mathf.PI;
	tmp = new Vector2(Mathf.Sin(x), Mathf.Cos(x));
	tmp.Normalize();
	w.Push( tmp );
	
	
	Debug.Log("Vettore dei pesi: " + w);
	
	
	for (var i:int = 0; i < 500; i++)	{
		
		// select a vector xj randomly
		var j:int = Mathf.Round(Random.value * 4);
		Debug.Log("Vettore degli input: " + inputVec);
		 
		// calculate xj * vi for all i
		var m:int = 0;
		var mVal = 0;
		var indice = 0;
		var xj:Vector2 = Vector2.zero;
	
		xj = inputVec[j];
		indice = 0;
		for (var wi:Vector2 in w)	{
		
			var tmpResult = xj.x * wi.x + xj.y * wi.y;
			// alla fine m contiene l'indice del vettore w tale che w*xj è maggiore.
			if(tmpResult > mVal)	{
				mVal = tmpResult;
				Debug.Log("m " + indice);
				m=indice;
			}
			indice ++;
		}
		
		Debug.Log("m vale " + m);
		var tmp2:Vector2 = w[m];
		var somma:Vector2 = tmp2 + xj;
		somma.Normalize();
		w[m] = somma;
	
	}
	
	Debug.Log("Vettore dei pesi FINALE " + w);
	
	for (var wcur:Vector2 in w)	{
		createVector(wcur.x, wcur.y);
	}/*
	var aa:Vector2 = w[0];
	var bb:Vector2 = w[1];
	var cc:Vector2 = w[3];
	createVector(aa.x, aa.y);
	createVector(bb.x, bb.y);*/
}

function createVector(angle:float)	{
	// vettore 3
	var gameObject:GameObject = new GameObject();
	var lRenderer = gameObject.AddComponent(LineRenderer);
	lRenderer.SetVertexCount(2);
	lRenderer.SetWidth(0.2, 0.2);
	lRenderer.material.color = Color.green;
	//lRenderer.SetColors( Color.green, Color.green );
	lRenderer.SetPosition(0, Vector3.zero );
	//var tmp:Vector3 = Vector3.Slerp(Vector3.left, Vector3.right, 0.5);
	
	var tmp:Vector2 = new Vector2(Mathf.Cos(angle), Mathf.Sin(angle));
	lRenderer.SetPosition(1, new Vector3(Mathf.Cos(angle), Mathf.Sin(angle), 0.0) * 5 );
	
	tmp.Normalize();
	inputVec.Push( tmp );
	
	input.Push(gameObject);
}

function createVector(x:float, y:float)	{
	// vettore 3
	var gameObject:GameObject = new GameObject();
	var lRenderer = gameObject.AddComponent(LineRenderer);
	lRenderer.SetVertexCount(2);
	lRenderer.SetWidth(0.2, 0.2);
	lRenderer.material.color = Color.red;
	//lRenderer.SetColors( Color.green, Color.green );
	lRenderer.SetPosition(0, Vector3.zero );
	//var tmp:Vector3 = Vector3.Slerp(Vector3.left, Vector3.right, 0.5);
	
	var tmp2:Vector3 = new Vector3(x, y, 0.0);
	tmp2.Normalize();
	lRenderer.SetPosition(1, tmp2 * 5 );
	
	
	input.Push(gameObject);
}

function test()	{
	
}

/* sostituisce wm con wm * xj */
function update(m:int, xj:Vector2)	{
	
}

function Update () {

}