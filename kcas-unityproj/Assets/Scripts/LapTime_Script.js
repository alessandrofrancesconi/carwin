#pragma strict

private var startTime : float;
private var textTime : String;
private var startOfRace : boolean = false;
var totalTimes : Array;

function Start () {
	startOfRace = false;
	totalTimes = new Array();
}


function Update () {}


function OnTriggerEnter (other:Collider)
{
	if (startOfRace && Time.time - startTime > 2) { 
		// save laptime only from the second lap and discarding double collisions
		totalTimes.Push(Time.time - startTime);
		print("LAP " + totalTimes.length + " -> " + startTime);
	}
	
	// set the starting time of the timer
	startTime = Time.time;
	startOfRace = true;
}


// function called every frame to draw GUI objects
function OnGUI () {
	if (startOfRace == true)	{
		// guiTime is the number of milliseconds passed from startTime
	   	var guiTime = Time.time - startTime;
	   	var textTime = String.Format ("{0:00}:{1:00}:{2:000}", guiTime / 60, guiTime % 60, (guiTime * 100) % 100); 
	   	GUI.Label (Rect (Screen.width -200, 25, 100, 30), textTime);
		
		var i : int = 2;
		for (var lapTime : float in totalTimes) {
			textTime = (i-1) + ") " + String.Format ("{0:00}:{1:00}:{2:000}", lapTime / 60, lapTime % 60, (lapTime * 100) % 100); 
			GUI.Label (Rect (Screen.width -190, 25*i, 100, 30), textTime);
			i++;
		}
   	}
}
