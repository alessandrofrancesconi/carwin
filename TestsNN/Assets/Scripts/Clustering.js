#pragma strict

private var input : Array;
private var inputVec : Array;

function Start () {
	
	input = new Array();
	inputVec = new Array();
	
	
	var gameObject:GameObject;
	
	// vettore 0
	gameObject = new GameObject();
	var lRenderer:LineRenderer = gameObject.AddComponent(LineRenderer);
	lRenderer.SetVertexCount(2);
	lRenderer.SetWidth(0.2, 0.2);
	lRenderer.material.color = Color.green;
	//lRenderer.SetColors( Color.green, Color.green );
	lRenderer.SetPosition(0, Vector3.zero );
	lRenderer.SetPosition(1, Vector3.left * 5 );
	inputVec.Push(new Vector2(-1.0, 0.0));
	
	input.Push(gameObject);
	
	
	// vettore 1
	gameObject = new GameObject();
	lRenderer = gameObject.AddComponent(LineRenderer);
	lRenderer.SetVertexCount(2);
	lRenderer.SetWidth(0.2, 0.2);
	lRenderer.material.color = Color.green;
	//lRenderer.SetColors( Color.green, Color.green );
	lRenderer.SetPosition(0, Vector3.zero );
	//var tmp:Vector3 = Vector3.Slerp(Vector3.left, Vector3.right, 0.5);
	lRenderer.SetPosition(1, new Vector3(-1.0, 1.0, 0.0).normalized * 5 );
	inputVec.Push(new Vector2(-1.0, 1.0).normalized);
	
	input.Push(gameObject);
	
	// vettore 2
	gameObject = new GameObject();
	lRenderer = gameObject.AddComponent(LineRenderer);
	lRenderer.SetVertexCount(2);
	lRenderer.SetWidth(0.2, 0.2);
	lRenderer.material.color = Color.green;
	//lRenderer.SetColors( Color.green, Color.green );
	lRenderer.SetPosition(0, Vector3.zero );
	//var tmp:Vector3 = Vector3.Slerp(Vector3.left, Vector3.right, 0.5);
	lRenderer.SetPosition(1, new Vector3(-0.8, 1.5, 0.0).normalized * 5 );
	inputVec.Push( new Vector2(-0.8, 1.5).normalized);
	
	input.Push(gameObject);
	
	// vettore 3
	gameObject = new GameObject();
	lRenderer = gameObject.AddComponent(LineRenderer);
	lRenderer.SetVertexCount(2);
	lRenderer.SetWidth(0.2, 0.2);
	lRenderer.material.color = Color.green;
	//lRenderer.SetColors( Color.green, Color.green );
	lRenderer.SetPosition(0, Vector3.zero );
	//var tmp:Vector3 = Vector3.Slerp(Vector3.left, Vector3.right, 0.5);
	lRenderer.SetPosition(1, new Vector3(Mathf.Cos(0.25), Mathf.Sin(0.25), 0.0) * 5 );
	inputVec.Push( new Vector2(Mathf.Cos(0.25), Mathf.Sin(0.25)) );
	
	// vettore 3
	gameObject = new GameObject();
	lRenderer = gameObject.AddComponent(LineRenderer);
	lRenderer.SetVertexCount(2);
	lRenderer.SetWidth(0.2, 0.2);
	lRenderer.material.color = Color.green;
	//lRenderer.SetColors( Color.green, Color.green );
	lRenderer.SetPosition(0, Vector3.zero );
	//var tmp:Vector3 = Vector3.Slerp(Vector3.left, Vector3.right, 0.5);
	lRenderer.SetPosition(1, new Vector3(Mathf.Cos(0.12), Mathf.Sin(0.12), 0.0) * 5 );
	inputVec.Push( new Vector2(Mathf.Cos(0.12), Mathf.Sin(0.12)) );
	
	input.Push(gameObject);
	
	
	/*
	L'insieme di vettori di input X è inputVec. (pag 112 libro)
	scelgo il numero di cluster k=2, e genero a caso 2 pesi.
	*/
	var w:Array = new Array();
	var x = Random.value * Mathf.PI;
	w.Push(new Vector2(Mathf.Sin(x), Mathf.Cos(x)));
	Debug.Log(x);
	x = Random.value * Mathf.PI;
	w.Push(new Vector2(Mathf.Sin(x), Mathf.Cos(x)));
	Debug.Log(x);
	
	
	// select a vector xj randomly
	var j:int = Mathf.Round(Random.value * 4);
	Debug.Log(inputVec);
	 
	// calculate xj * vi for all i
	var m:int = 0;
	var mVal = 0;
	var indice = 0;
	var xj:Vector2 = Vector2.zero;
	for (var mioJ:Vector2 in inputVec)	{
		Debug.Log(indice + " -> " + mioJ);
		if(indice == j)
			xj = mioJ;
		indice ++;
	}
	indice = 0;
	for (var wi:Vector2 in w)	{
	
		var tmpResult = xj.x * wi.x + xj.y * wi.y;
		if(tmpResult > mVal)	{
			Debug.Log("m " + indice);
			m=indice;
		}
		indice ++;
	}
	
}

function Update () {

}