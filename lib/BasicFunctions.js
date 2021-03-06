var WINDOWBORDERSIZE = 10;
var HUGE = 999999; //Sometimes useful when testing for big or small numbers
var animationDelay = 200; //controls simulation and transition speed
var isRunning = false; // used in simStep and toggleSimStep
var surface; // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
var simTimer; // Set in the initialization function

//The drawing surface will be divided into logical cells
var maxCols = 40;
var cellWidth; //cellWidth is calculated in the redrawWindow function
var cellHeight; //cellHeight is calculated in the redrawWindow function


//images
const urlPatientPriority = "images/prioritypatient.png";
const urlPatientNormal = "images/patientnormal.png";
const urlPatientDelivery = "images/takeaway.png";

const urlPillPriority = "images/pillpriority.png";
const urlPillNormal = "images/pillnormal.png";
const urlPillDelivery = "images/pilldelivery.png";
const urlMDispenser = "images/misseddispenser.png";
const urlDispenser = "images/vending-machine.png";
const urlPicker = "images/pharmacist.png";
const urlDelivery = "images/delivery.png";
const urlQueue = "images/queue.png";
const urlExit = "images/exit.png";
const urlCounter = "images/counter.png";
const urlReceptionist ="images/receptionist.png";

//Caregiver types
const RECEPTIONIST = 1;
const DISPENSER = 2;
const DELIVERYQUEUE = 3;
const NORMALQUEUE = 4;
const PRIORITYQUEUE = 5;
const PICKER = 6;
const INCOUNTER = 7;
const MCOUNTER = 8;
const DELIVERYOFFICE = 9;
const EXIT = 10;
const MDISPENSER = 11;

const IDLE = 0;
const BUSY = 1;


//status for prescription or patient
const QDELIVERY = 1;
const QNORMAL = 2;
const QPRIORITY = 3;

// state of a patient in the hospital
const PATIENT_UNREGISTERED = 0;
const PATIENT_REGISTERED = 1;
const PATIENT_CALLED = 2;
const PATIENT_WALKING = 3; 
const PATIENT_RECEIVING = 4;
const PATIENT_TRANSFER = 5;
const PATIENT_MISSEDQUEUE = 6;
const PATIENT_MISSEDWALKING = 7;
const PATIENT_MISSEDRECEIVING = 8;
const PATIENT_COMPLETE = 9;
const PATIENT_REMOVE = 10;

// state of a prescription in the hospital
const PRESCRIPTION_UNREGISTERED = 0;
const PRESCRIPTION_REGISTERED = 1;
const PRESCRIPTION_PRIORITYQUEUE = 2; 
const PRESCRIPTION_NORMALQUEUE = 3;
const PRESCRIPTION_DELIVERYQUEUE = 4;
const PRESCRIPTION_PICKING = 5;
const PRESCRIPTION_PICKED = 6;
const PRESCRIPTION_STAGING = 7;
const PRESCRIPTION_TRANSFER = 8;
const PRESCRIPTION_MISSEDSTAGING = 9;
const PRESCRIPTION_DELIVERY = 10;
const PRESCRIPTION_REMOVE = 11;

// state of the picker
const PICKER_AVAILABLE = 0
const PICKER_BUSY = 1

// state of a general dispenser in the hospital
const DISPENSER_AVAILABLE=0;
const DISPENSER_WAITING=1;
const DISPENSER_BUSY=2; 

// state of a dispenser in the missed queue in the hospital
const MDISPENSER_AVAILABLE=0;
const MDISPENSER_BUSY=1;

// Location Consts
// change when coding gui
const LOCreceptionistRow = 2
const LOCreceptionistCol = 7

//prescription
const LOCdeliveryQueueRow = 2
const LOCdeliveryQueueCol = 30
const LOCnormalQueueRow = 2
const LOCnormalQueueCol = 25
const LOCpriorityQueueRow = 2
const LOCpriorityQueueCol = 20

//prescription
const LOCpickingRow = 4
const LOCpickingCol = 25
const LOCstagingRow = 6
const LOCstagingCol = 20

const LOCcounterRow = LOCstagingRow + 2
const LOCcounterCol = LOCstagingCol

const LOCdispenserRow = LOCstagingRow + 1
const LOCdispenserCol = LOCstagingCol

const LOCmissedQueueRow = 10
const LOCmissedQueueCol = 20
const LOCmissedstagingRow = 10 //prescription
const LOCmissedstagingCol = 25 //prescription
const LOCmissedCounterRow = LOCmissedstagingRow + 2
const LOCmissedCounterCol = LOCmissedstagingCol
const LOCmdispenserRow = LOCmissedstagingRow + 1
const LOCmdispenserCol = LOCmissedstagingCol

const LOCexitRow = 12
const LOCexitCol = 7
const LOCdeliveryOfficeRow = 8
const LOCdeliveryOfficeCol = 30

const LOCseatstartrow = 6
const LOCseatendrow = 11
const LOCseatstartcol = 9
const LOCseatendcol = 16

//wait time probabilities
var pickerMEAN = parseInt(document.getElementById("pickerMEAN").value)//10
var pickerSD = parseInt(document.getElementById("pickerSD").value)//5
//note: same parameters for both dispenser and mdispenser
var dispenserMEAN = parseInt(document.getElementById("dispenserMEAN").value)//50
var dispenserSD = parseInt(document.getElementById("dispenserSD").value)//5
var patientMEAN = parseInt(document.getElementById("patientMEAN").value)//100
var patientSD = parseInt(document.getElementById("patientSD").value)//5

// fixed dispenser tolerance
var dispenserTolerance = parseInt(document.getElementById("dispenserTolerance").value)//10

// Probabilties
var ProbPatientDelivery = parseFloat(document.getElementById("ProbPatientDelivery").value)//0.5; 
// set the patient's likelihood to be a delivery patient
var ProbPatientPriority = parseFloat(document.getElementById("ProbPatientPriority").value)//0.4; 
// set the patient's likelihood to be a priority patient given its non-delivery
var ProbReact = parseFloat(document.getElementById("ProbReact").value)//0.90; 
// probability patient responds when number is called
var probArrival = parseFloat(document.getElementById("probArrival").value)//0.1;

function updateProbabilities(){
    pickerMEAN = parseInt(document.getElementById("pickerMEAN").value)
    pickerSD = parseInt(document.getElementById("pickerSD").value)
    dispenserMEAN = parseInt(document.getElementById("dispenserMEAN").value)
    dispenserSD = parseInt(document.getElementById("dispenserSD").value)
    patientMEAN = parseInt(document.getElementById("patientMEAN").value)
    patientSD = parseInt(document.getElementById("patientSD").value)
    dispenserTolerance = parseInt(document.getElementById("dispenserTolerance").value)
    ProbPatientDelivery = parseFloat(document.getElementById("ProbPatientDelivery").value)
    ProbPatientPriority = parseFloat(document.getElementById("ProbPatientPriority").value)
    ProbReact = parseFloat(document.getElementById("ProbReact").value)
    probArrival = parseFloat(document.getElementById("probArrival").value)
}

// from 
// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/36481059#36481059
function stdNormalDistribution () {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

var currentTime = 0;
//list of queues and statistics
var queues = [ //for display of variables like queue length
    {"name":"Registration Q: ","location":{"row":LOCreceptionistRow - 1,"col":LOCreceptionistCol},"length":0},
    {"name":"Priority Q: ","location":{"row":LOCpriorityQueueRow - 1,"col":LOCpriorityQueueCol},"length":0},
    {"name":"Normal Q: ","location":{"row":LOCnormalQueueRow - 1,"col":LOCnormalQueueCol},"length":0},
    {"name":"Delivery Q: ", "location":{"row":LOCdeliveryQueueRow - 1,"col":LOCdeliveryQueueCol},"length":0},
    {"name":"Prescription Staging Q: ", "location":{"row":LOCstagingRow - 1,"col":LOCstagingCol-1},"length":0},
    {"name":"Prescription Missed Q: ", "location":{"row":LOCmissedstagingRow - 1,"col":LOCmissedstagingCol-1},"length":0},
    {"name":"Patient Missed Q: ", "location":{"row":LOCmissedQueueRow - 1,"col":LOCmissedQueueCol-1},"length":0}
];
//statistics
var statistics = [
    {"name":"Avg time in Pharmacy (Normal Patient): ", "location":{"row": LOCseatendrow+1, "col": LOCseatstartcol}, "cumulativeValue":0,"count":0},
    {"name":"Avg time in Pharmacy (Priority Patient): ", "location":{"row": LOCseatendrow+2, "col": LOCseatstartcol}, "cumulativeValue":0,"count":0},
    {"name":"Avg time for Prescription to be Dispensed (Normal): ", "location":{"row": LOCseatendrow+3, "col": LOCseatstartcol}, "cumulativeValue":0,"count":0},
    {"name":"Avg time for Prescription to be Dispensed (Priority): ", "location":{"row": LOCseatendrow+4, "col": LOCseatstartcol}, "cumulativeValue":0,"count":0},
    {"name":"Avg time for Prescription to reach Delivery Office (Delivery): ", "location":{"row": LOCseatendrow+5, "col": LOCseatstartcol}, "cumulativeValue":0,"count":0},
    {"name":"Percentage of Missed Prescriptions (Normal and Priority): ", "location":{"row": LOCseatendrow+6, "col": LOCseatstartcol}, "cumulativeValue":0,"count":0}
];
/* var statistics = [
    {"name":"Average time in clinic, Type A: ","location":{"row":doctorRow+3,"col":doctorCol-4},"cumulativeValue":0,"count":0},
    {"name":"Average time in clinic, Type B: ","location":{"row":doctorRow+4,"col":doctorCol-4},"cumulativeValue":0,"count":0},
    {"name":"Average percentage of patients rejected: ", "location":{"row":doctorRow+5, "col":doctorCol-4},"cumulativeValue":0,"count":0}
   ]; */

//queues variable
//Next: give queue number to object when setting up
//Call: used by agent to call object
// value to be assigned to the next missed patient
var QUEUE_MISSED_NEXT = 1;
// value of missed patient to be called next
var QUEUE_MISSED_CALL = 1;

// value to be assigned to the next staged prescription
var QUEUE_STAGED_NEXT = 1;
// value of staged prescription to be called next
var QUEUE_STAGED_CALL = 1;

// value to be assigned to the next priority prescription
var QUEUE_PRIORITY_NEXT = 1;
// value of priority prescription to be called next
var QUEUE_PRIORITY_CALL = 1;

// value to be assigned to the next normal prescription
var QUEUE_NORMAL_NEXT = 1;
// value of normal prescription to be called next
var QUEUE_NORMAL_CALL = 1;

// value to be assigned to the next delivery prescription
var QUEUE_DELIVERY_NEXT = 1;
// value of delivery prescription to be called next
var QUEUE_DELIVERY_CALL = 1;

// Holding List for Patient and Prescription Information
var patients = [];
var prescriptions = [];

var caregivers = [
    {"type":RECEPTIONIST,"label":"Receptionist","location":{"row":LOCreceptionistRow,"col":LOCreceptionistCol},"state":IDLE},
    {"type":DISPENSER,"label":"Dispenser","location":{"row":LOCdispenserRow,"col":LOCdispenserCol},"state":DISPENSER_AVAILABLE},
    {"type":DELIVERYQUEUE, "label":"Delivery Queue", "location":{"row": LOCdeliveryQueueRow, "col":LOCdeliveryQueueCol}},
    {"type":NORMALQUEUE, "label":"Normal Queue", "location":{"row": LOCnormalQueueRow, "col":LOCnormalQueueCol}},
    {"type":PRIORITYQUEUE, "label":"Priority Queue", "location":{"row": LOCpriorityQueueRow, "col":LOCpriorityQueueCol}},
    {"type":PICKER, "label":"Picker", "location":{"row": LOCpickingRow, "col":LOCpickingCol}, "state":PICKER_AVAILABLE},
    {"type":INCOUNTER, "label":"Counter", "location":{"row": LOCcounterRow, "col":LOCcounterCol}},
    {"type":MCOUNTER, "label":"Missed Counter", "location":{"row": LOCmissedCounterRow, "col":LOCmissedCounterCol}},
    {"type":DELIVERYOFFICE, "label":"Delivery Office", "location":{"row": LOCdeliveryOfficeRow, "col":LOCdeliveryOfficeCol}},
    {"type":EXIT, "label":"Exit", "location":{"row": LOCexitRow, "col":LOCexitCol}},
    {"type":MDISPENSER,"label":"Missed Dispenser","location":{"row":LOCmdispenserRow,"col":LOCmdispenserCol},"state":MDISPENSER_AVAILABLE}
];
var doctor = caregivers[0]; // the doctor is the first element of the caregivers list.

//copy-pasted from the homework example -> this bit here stores what the relevant areas are
var areas =[
    {"label":"Waiting Area","startRow":LOCseatstartrow,"numRows":LOCseatendrow-LOCseatstartrow,"startCol":LOCseatstartcol,"numCols":LOCseatendcol-LOCseatstartcol,"color":"pink"},
    {"label":"Missed Queue Area","startRow":LOCmissedQueueRow,"numRows":1,"startCol":LOCmissedQueueCol,"numCols":1,"color":"yellow"},
    {"label":"Prescription Staging","startRow":LOCstagingRow,"numRows":1,"startCol":LOCstagingCol,"numCols":1,"color":"orange"},
    {"label":"Prescription Missed Staging","startRow":LOCmissedstagingRow,"numRows":1,"startCol":LOCmissedstagingCol,"numCols":1,"color":"orange"}
]

// Fixed number of dispensers and missed dispensers
var dispenser = {"state":DISPENSER_AVAILABLE, 
    "id": -1, // which prescription ID is picked
    "waitStop": 0,
    "dispenseStop": 0,
}

var mdispenser = {"state":MDISPENSER_AVAILABLE, 
    "dispenseStop": 0,
    //"case": -1, // which prescription is picked
}

var picker = {"state":PICKER_AVAILABLE, 
    //"case": -1, // which prescription is picked
    "pickStop": -1
}

// Patient ID Count
var NextPatientID = 1; // initialise the first patient ID with 1

//Variables for Output Analysis
var DeliveryTotal = 0; // record the cumulative totals for deliveries
var CompletedTotal = 0; // record cumulative total patients served (inc delivery)

//to set up waiting seats
// Dynamic array for seats
var waitingSeats = [];
var iterate = 0;
// Constants for seat occupation
const EMPTY = 0;
const OCCUPIED = 1;
for(r = LOCseatstartrow; r < LOCseatendrow; r++) {
	for(c = LOCseatstartcol; c < LOCseatendcol; c++) {
		var seatstate={'row': r, 'col': c, 'occupation': Number(EMPTY), 'seatNum': iterate}
		waitingSeats.push(seatstate);
		iterate++;
	}
}

// This next function is executed when the script is loaded. It contains the page initialization code.
(function() {
	// Your page initialization code goes here
	// All elements of the DOM will be available here
	window.addEventListener("resize", redrawWindow); //Redraw whenever the window is resized
	simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds
	redrawWindow();
})();

function toggleSimStep(){ 
	//this function is called by a click event on the html page. 
	// Search BasicAgentModel.html to find where it is called.
	isRunning = !isRunning;
	//console.log("isRunning: "+isRunning);
}

function redrawWindow(){
	isRunning = false; // used by simStep
	window.clearInterval(simTimer); // clear the Timer
	animationDelay = 550 - document.getElementById("slider1").value;
	simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds
	
    /*
    What happens here in the original code:
    Variables + Statistics get reset every time the window is resized,
    since the simulation is reset to time = 0.
    */
   //reset patients and prescriptions list
    patients = [];
    prescriptions = [];
    

	// Re-initialize simulation variables
/* 	queues = [ //for display of variables like queue length
        {"name":"Registration Q: ","location":{"row":LOCreceptionistRow - 1,"col":LOCreceptionistCol},"length":0},
        {"name":"Priority Q: ","location":{"row":LOCpriorityQueueRow - 1,"col":LOCpriorityQueueCol},"length":0},
        {"name":"Normal Q: ","location":{"row":LOCnormalQueueRow - 1,"col":LOCnormalQueueCol},"length":0},
        {"name":"Delivery Q: ", "location":{"row":LOCdeliveryQueueRow - 1,"col":LOCdeliveryQueueCol},"length":0},
        {"name":"Prescription Staging Q: ", "location":{"row":LOCstagingRow - 1,"col":LOCstagingCol-1},"length":0},
        {"name":"Prescription Missed Q: ", "location":{"row":LOCmissedstagingRow - 1,"col":LOCmissedstagingCol-1},"length":0},
        {"name":"Patient Missed Q: ", "location":{"row":LOCmissedQueueRow - 1,"col":LOCmissedQueueCol-1},"length":0}
    ]
    caregivers = [
        {"type":RECEPTIONIST,"label":"Receptionist","location":{"row":LOCreceptionistRow,"col":LOCreceptionistCol},"state":IDLE},
        {"type":DISPENSER,"label":"Dispenser","location":{"row":LOCdispenserRow,"col":LOCdispenserCol},"state":DISPENSER_AVAILABLE},
        {"type":DELIVERYQUEUE, "label":"Delivery Queue", "location":{"row": LOCdeliveryQueueRow, "col":LOCdeliveryQueueCol}},
        {"type":NORMALQUEUE, "label":"Normal Queue", "location":{"row": LOCnormalQueueRow, "col":LOCnormalQueueCol}},
        {"type":PRIORITYQUEUE, "label":"Priority Queue", "location":{"row": LOCpriorityQueueRow, "col":LOCpriorityQueueCol}},
        {"type":PICKER, "label":"Picker", "location":{"row": LOCpickingRow, "col":LOCpickingCol}, "state":PICKER_AVAILABLE},
        {"type":INCOUNTER, "label":"Counter", "location":{"row": LOCcounterRow, "col":LOCcounterCol}},
        {"type":MCOUNTER, "label":"Missed Counter", "location":{"row": LOCmissedCounterRow, "col":LOCmissedCounterCol}},
        {"type":DELIVERYOFFICE, "label":"Delivery Office", "location":{"row": LOCdeliveryOfficeRow, "col":LOCdeliveryOfficeCol}},
        {"type":EXIT, "label":"Exit", "location":{"row": LOCexitRow, "col":LOCexitCol}},
        {"type":MDISPENSER,"label":"Missed Dispenser","location":{"row":LOCmdispenserRow,"col":LOCmdispenserCol},"state":MDISPENSER_AVAILABLE}
    ]; */
	currentTime = 0;

	statistics[0].cumulativeValue=0;
	statistics[0].count=0;
	statistics[1].cumulativeValue=0;
	statistics[1].count=0;
    statistics[2].cumulativeValue=0;
	statistics[2].count=0;
	statistics[3].cumulativeValue=0;
	statistics[3].count=0;
    statistics[4].cumulativeValue=0;
	statistics[4].count=0;
    statistics[5].cumulativeValue=0;
	statistics[5].count=0;


	// //modified bits: statistics 2 holds time information for rejected patients 
	// statistics[2].cumulativeValue=0;
	// statistics[2].count=0;	
	// // rejectedpatients simply holds the total number of rejected patients
	// rejectedpatients[0].cumulativeValue=0;
	// rejectedpatients[0].count=0;

	// patients = [];

	
	//resize the drawing surface; remove all its contents; 
	var drawsurface = document.getElementById("surface");
	var creditselement = document.getElementById("credits");
	var w = window.innerWidth;
	var h = window.innerHeight;
	var surfaceWidth =(w - 3*WINDOWBORDERSIZE);
	var surfaceHeight= (h-creditselement.offsetHeight - 3*WINDOWBORDERSIZE);
	
	drawsurface.style.width = surfaceWidth+"px";
	drawsurface.style.height = surfaceHeight+"px";
	drawsurface.style.left = WINDOWBORDERSIZE/2+'px';
	drawsurface.style.top = WINDOWBORDERSIZE/2+'px';
	drawsurface.style.border = "thick solid #0000FF"; //The border is mainly for debugging; okay to remove it
	drawsurface.innerHTML = ''; //This empties the contents of the drawing surface, like jQuery erase().
	
	// Compute the cellWidth and cellHeight, given the size of the drawing surface
	numCols = maxCols;
	cellWidth = surfaceWidth/numCols;
	numRows = Math.ceil(surfaceHeight/cellWidth);
	cellHeight = surfaceHeight/numRows;
	
	// In other functions we will access the drawing surface using the d3 library. 
	//Here we set the global variable, surface, equal to the d3 selection of the drawing surface
	surface = d3.select('#surface');
	surface.selectAll('*').remove(); // we added this because setting the inner html to blank may not remove all svg elements
	surface.style("font-size","100%");
	// rebuild contents of the drawing surface
	updateSurface();	
};

// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(location){
	var row = location.row;
	var col = location.col;
	var x = (col-1)*cellWidth; //cellWidth is set in the redrawWindow function
	var y = (row-1)*cellHeight; //cellHeight is set in the redrawWindow function
	return {"x":x,"y":y};
}

function updateSurface(){
	// This function is used to create or update most of the svg elements on the drawing surface.
	// See the function removeDynamicAgents() for how we remove svg elements
	
	//Select all svg elements of class "patient" and map it to the data list called patients
	var allpatients = surface.selectAll(".patient").data(patients);
	
	// If the list of svg elements is longer than the data list, the excess elements are in the .exit() list
	// Excess elements need to be removed:
	allpatients.exit().remove(); //remove all svg elements associated with entries that are no longer in the data list
	// (This remove function is needed when we resize the window and re-initialize the patients array)
	 
	// If the list of svg elements is shorter than the data list, the new elements are in the .enter() list.
	// The first time this is called, all the elements of data will be in the .enter() list.
	// Create an svg group ("g") for each new entry in the data list; give it class "patient"
	var newpatients = allpatients.enter().append("g").attr("class","patient"); 
	//Append an image element to each new patient svg group, position it according to the location data, and size it to fill a cell
	// Also note that we can choose a different image to represent the patient based on the patient type
	
    newpatients.append("svg:image")
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	 .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	 .attr("width", Math.min(cellWidth,cellHeight)+"px")
	 .attr("height", Math.min(cellWidth,cellHeight)+"px")
	 .attr("xlink:href",function(d){if (d.status==QPRIORITY) return urlPatientPriority;
        else if (d.status==QNORMAL) return urlPatientNormal; 
        else return urlPatientDelivery});
	
	// For the existing patients, we want to update their location on the screen 
	// but we would like to do it with a smooth transition from their previous position.
	// D3 provides a very nice transition function allowing us to animate transformations of our svg elements.
	
	//First, we select the image elements in the allpatients list
	var images = allpatients.selectAll("image");
	// Next we define a transition for each of these image elements.
	// Note that we only need to update the attributes of the image element which change
	images.transition()
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	 .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	 .duration(animationDelay).ease('linear'); // This specifies the speed and type of transition we want.

    
    var allprescriptions = surface.selectAll(".prescription").data(prescriptions);
    allprescriptions.exit().remove();

    var newprescriptions = allprescriptions.enter().append("g").attr("class","prescription"); 

    newprescriptions.append("svg:image")
    .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
    .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
    .attr("width", Math.min(cellWidth,cellHeight)+"px")
    .attr("height", Math.min(cellWidth,cellHeight)+"px")
    .attr("xlink:href",function(d){if (d.status==QPRIORITY) return urlPillPriority;
        else if (d.status==QNORMAL) return urlPillNormal; 
        else return urlPillDelivery});

    var imagesP = allprescriptions.selectAll("image");

    imagesP.transition()
    .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
    .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
    .duration(animationDelay).ease('linear'); // This specifies the speed and type of transition we want.

    //Select all svg elements of class "caregiver" and map it to the data list called caregivers
	var allcaregivers = surface.selectAll(".caregiver").data(caregivers);
	//This is not a dynamic class of agents so we only need to set the svg elements for the entering data elements.
	// We don't need to worry about updating these agents or removing them
	// Create an svg group ("g") for each new entry in the data list; give it class "caregiver"

    
	var newcaregivers = allcaregivers.enter().append("g").attr("class","caregiver");
	newcaregivers.append("svg:image")
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	 .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	 .attr("width", Math.min(cellWidth,cellHeight)+"px")
	 .attr("height", Math.min(cellWidth,cellHeight)+"px")
	 .attr("xlink:href",function(d){if (d.type==DISPENSER) return urlDispenser;
        else if (d.type==PICKER) return urlPicker;
        else if (d.type==DELIVERYOFFICE) return urlDelivery;
        else if (d.type==DELIVERYQUEUE) return urlQueue;
        else if (d.type==NORMALQUEUE) return urlQueue;
        else if (d.type==PRIORITYQUEUE) return urlQueue;
        else if (d.type==MDISPENSER) return urlMDispenser;
        else if (d.type==INCOUNTER) return urlCounter;
        else if (d.type==MCOUNTER) return urlCounter;
        else if (d.type==EXIT) return urlExit;
        return urlReceptionist
    });
	
	// // It would be nice to label the caregivers, so we add a text element to each new caregiver group
	newcaregivers.append("text")
    .attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+cellWidth)+"px"; })
    .attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+cellHeight/2)+"px"; })
    .attr("dy", ".35em")
    .text(function(d) { return d.label; });
	
    //Statistics Section/Queue Here

	// We created the array "statistics" for this purpose.
	// Here we will create a group for each element of the statistics array (two elements)
	var allstatistics = surface.selectAll(".statistics").data(statistics);
	var newstatistics = allstatistics.enter().append("g").attr("class","statistics");
	// // For each new statistic group created we append a text label
	newstatistics.append("text")
	.attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+cellWidth)+"px"; })
    .attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+cellHeight/2)+"px"; })
    .attr("dy", ".35em")
    .text(""); 

	// The data in the statistics array are always being updated.
	// So, here we update the text in the labels with the updated information.
	allstatistics.selectAll("text").text(function(d) {
		var avgLengthOfStay = d.cumulativeValue/(Math.max(1,d.count)); // cumulativeValue and count for each statistic are always changing
		return d.name+avgLengthOfStay.toFixed(1); }); //The toFixed() function sets the number of decimal places to display

    // Queue section
    	// We created the array "statistics" for this purpose.
	// Here we will create a group for each element of the statistics array (two elements)
	var allqueues = surface.selectAll(".queue").data(queues);
	var newqueues = allqueues.enter().append("g").attr("class","queue");
	// // For each new statistic group created we append a text label
	newqueues.append("text")
	.attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+cellWidth)+"px"; })
    .attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+cellHeight/2)+"px"; })
    .attr("dy", ".35em")
    .text(""); 

	// The data in the statistics array are always being updated.
	// So, here we update the text in the labels with the updated information.
	allqueues.selectAll("text").text(function(d) {
		return d.name+d.length.toFixed(1); }); //The toFixed() function sets the number of decimal places to display

	// Finally, we would like to draw boxes around the different areas of our system. We can use d3 to do that too.
	var allareas = surface.selectAll(".areas").data(areas);
	var newareas = allareas.enter().append("g").attr("class","areas");

	// For each new area, append a rectangle to the group
	newareas.append("rect")
	.attr("x", function(d){return (d.startCol-1)*cellWidth;})
	.attr("y",  function(d){return (d.startRow-1)*cellHeight;})
	.attr("width",  function(d){return d.numCols*cellWidth;})
	.attr("height",  function(d){return d.numRows*cellWidth;})
	.style("fill", function(d) { return d.color; })
	.style("stroke","black")
	.style("stroke-width",1);
	
}

function addDynamicAgents(){
	// Patients are dynamic agents: they enter the clinic, wait, get treated, and then leave
	// We have entering patients of two types "A" and "B"
	// We could specify their probabilities of arrival in any simulation step separately
	// Or we could specify a probability of arrival of all patients and then specify the probability of a Type A arrival.
	// We have done the latter. probArrival is probability of arrival a patient and probTypeA is the probability of a type A patient who arrives.
	// First see if a patient arrives in this sim step.

    // Prescription will be added at registration
	if (Math.random()< probArrival){
        // patient tolerance with mu = 1000 and sd = 10
        // Note: time is every refresh on screen, im not sure what correlation it has with real time
        pat_tolerance = patientMEAN + stdNormalDistribution()*patientSD
		var newpatient = {
            "id":NextPatientID,
            "status":"QDELIVERY",
            "location":{"row":1,"col":1},
            "target":{"row":LOCreceptionistRow,"col":LOCreceptionistCol},
            "state":PATIENT_UNREGISTERED,
            "timeRegistered":0, // to check if patient will leave or not
            "tolerance":pat_tolerance,
            "seatNum": -1,
            "missedq": -1};
		if (Math.random()<ProbPatientDelivery) newpatient.status = QDELIVERY;
		else if (Math.random()<ProbPatientPriority) newpatient.status = QPRIORITY;
        else newpatient.status = QNORMAL;
		patients.push(newpatient);
        NextPatientID += 1;
        //console.log(patients);
	}
	
}

//update patient state
function updatePatient(patientIndex){
	//patientID is an index into the patients data array
	patientIndex = Number(patientIndex); //it seems patientID was coming in as a string
	var patient = patients[patientIndex];
    //console.log("Patient State"+patient.state)
	// get the current location of the patient
	var row = patient.location.row;
	var col = patient.location.col;
	var state = patient.state;
	
	
	// determine if patient has arrived at destination
	var hasArrived = (Math.abs(patient.target.row-row)+Math.abs(patient.target.col-col))==0;
	
	// Behavior of patient depends on his or her state
	switch(state){
		case PATIENT_UNREGISTERED:
            if (hasArrived){
                var seatAvailable = waitingSeats.filter(function(d){return d.occupation == EMPTY});
                var qnumber = 0


                //console.log("Patient Status"+patient.status);
                //if patient is "DELIVERY" send to 
                if (patient.status == QDELIVERY){
                    //console.log("enter")
                    patient.target.row = LOCexitRow;
                    patient.target.col = LOCexitCol;
                    patient.state = PATIENT_COMPLETE;
                    qnumber = QUEUE_DELIVERY_NEXT
                    QUEUE_DELIVERY_NEXT ++
                    
                }
                // if there are seats
                else if (seatAvailable.length > 0){
                    patient.state = PATIENT_REGISTERED;
                    patient.timeRegistered = currentTime;

                    //Assign seating
                    var seat = seatAvailable[Math.floor(Math.random() * seatAvailable.length)];
                    //console.log(seat);
                    var seatChosen = Number(seat.seatNum);
                    //console.log(seatChosen);

                    //chope the seat
                    waitingSeats[seatChosen].occupation = OCCUPIED;

                    //Update Targets
                    patient.target.row = seat.row;
                    patient.target.col = seat.col;

                    // Update seatNum into patient
                    patient.seatNum = seatChosen;

                    // sets up queue number
                    var qnumber
                    var templocationrow =0, templocationcol=0;

                    if (patient.status == QPRIORITY){
                        qnumber = QUEUE_PRIORITY_NEXT
                        QUEUE_PRIORITY_NEXT ++
                        templocationrow =LOCpriorityQueueRow;
                        templocationcol =LOCpriorityQueueCol;
                    }
                    else if (patient.status == QNORMAL){
                        qnumber = QUEUE_NORMAL_NEXT
                        QUEUE_NORMAL_NEXT ++
                        templocationrow =LOCnormalQueueRow;
                        templocationcol =LOCnormalQueueCol;
                    }   
                }                

                // Creates new prescription
                var intpresc = {"id":patient.id, 
                "status":patient.status,
                "location":{"row":LOCreceptionistRow,"col":LOCreceptionistCol}, 
                "target":{"row":LOCreceptionistRow,"col":LOCreceptionistCol}, 
                "state":PRESCRIPTION_REGISTERED,
                "qnumber":qnumber,
                "timeRegistered":currentTime}

                prescriptions.push(intpresc);            

                // Queue forms, but patient overlaps
                // Since patient ID is generated sequentially, 
                // the patient with the smaller number goes first
                // effectively forming a queue
                // NEED TO CHECK ABOVE REQUIREMENT!
            }
        break;

        case PATIENT_REGISTERED:
            //goes home if waiting time exceeds 
            if ((currentTime - patient.timeRegistered) >= patient.tolerance){
                patient.target.row = LOCexitRow;
                patient.target.col = LOCexitCol;
                patient.state = PATIENT_COMPLETE;

                // makes seat empty
                if (patient.seatNum != -1) waitingSeats[patient.seatNum].occupation = Number(EMPTY);
				patient.seatNum = -1
            }
            else if (dispenser.id == patient.id){
                patient.state = PATIENT_CALLED
            }

            break;

        case PATIENT_CALLED:
            //note: transition to PATIENT_CALLED state will be made in updateprescription
            // Reacts sometimes when being called
            console.log("HELLO PATIENT_CALLED")
            console.log(patient.id)
            if (Math.random()<ProbReact){
                console.log("HELLO PATIENT_REACT")
                console.log(patient.id)
                // set target and state
                patient.target.row = LOCcounterRow;
                patient.target.col = LOCcounterCol;
                patient.state = PATIENT_WALKING;

                // makes seat empty
                if (patient.seatNum != -1) waitingSeats[patient.seatNum].occupation = Number(EMPTY);
				patient.seatNum = -1

                // Activates dispenser
                dispenser.state = DISPENSER_BUSY
                dispenser.dispenseStop = currentTime + dispenserMEAN + stdNormalDistribution()*dispenserSD;
            }
            // note: dispenser will wait once patient starts walking
            // if patient misses call, it will be dealt in updatePrescription
            break;

        case PATIENT_WALKING:
            console.log("HELLO PATIENT_WALKING")
            console.log(patient.id)
            if (hasArrived){
                //transition to PATIENT_RECEIVING
                patient.state = PATIENT_RECEIVING;
            }
            break;

        case PATIENT_RECEIVING:
            console.log("HELLO PATIENT_RECEIVING")
            console.log(patient.id)
            // updates only when dispensing reaches the end
            var prescriptionIdx = prescriptions.findIndex(prescription => prescription.id == patient.id)
            // dispenser takes prescription
            prescriptions[prescriptionIdx].target.row = LOCdispenserRow
            prescriptions[prescriptionIdx].state.col = LOCdispenserCol
            
            if (currentTime >= dispenser.dispenseStop){
                // remove prescription
                prescriptions[prescriptionIdx].state = PRESCRIPTION_REMOVE
                // set patient for exit
                patient.state = PATIENT_COMPLETE
                patient.target.row = LOCexitRow
                patient.target.col = LOCexitCol

                //reset dispenser
                dispenser = {"state":DISPENSER_AVAILABLE, 
                "id": -1, // which prescription is picked
                "waitStop": 0,
                "dispenseStop": 0
                }
            }

            break;

        case PATIENT_TRANSFER: // transfer to a missed queue
            // this state will be set by updateDispenser()
            if (hasArrived){
                //transition to PATIENT_MISSEDQUEUE and get queue number
                patient.state = PATIENT_MISSEDQUEUE; 
                patient.missedq = QUEUE_MISSED_NEXT
                QUEUE_MISSED_NEXT ++
            }
            break;

        case PATIENT_MISSEDQUEUE:
            // waits until mdispenser is free and its patient's turn
            if (mdispenser.state == MDISPENSER_AVAILABLE && 
                patient.missedq == QUEUE_MISSED_CALL){
                    //prepare for the next missed queue
                    QUEUE_MISSED_CALL ++
                    // patient reach target
                    patient.target.row = LOCmissedCounterRow
                    patient.target.col = LOCmissedCounterCol
                    patient.state = PATIENT_MISSEDWALKING

                    // set up mdispenser
                    mdispenser.state = MDISPENSER_BUSY
                }
            break;

        case PATIENT_MISSEDWALKING:
            // patient goes to the missed queue counter
            // goes to receive medicine if both patient and prescription arrives
            var prescriptionIdx = prescriptions.findIndex(prescription => prescription.id == patient.id)
            if (prescriptionIdx != undefined){
                if (hasArrived && 
                    prescriptions[prescriptionIdx].state == PRESCRIPTION_MISSEDSTAGING){
                        patient.state =  PATIENT_MISSEDRECEIVING;
                        mdispenser.dispenseStop = currentTime + dispenserMEAN + stdNormalDistribution()*dispenserSD;
                        prescriptions[prescriptionIdx].target.row = LOCmdispenserRow
                        prescriptions[prescriptionIdx].target.col = LOCmdispenserCol
                }
            }
            break;

        case PATIENT_MISSEDRECEIVING:
            if (currentTime >= mdispenser.dispenseStop){
                // remove prescription
                var prescriptionIdx = prescriptions.findIndex(prescription => prescription.id == patient.id)
                if (prescriptionIdx !== undefined){
                    prescriptions[prescriptionIdx].state = PRESCRIPTION_REMOVE
                }

                // set patient for exit
                patient.state = PATIENT_COMPLETE
                patient.target.row = LOCexitRow
                patient.target.col = LOCexitCol

                //reset mdispenser
                mdispenser = {"state":MDISPENSER_AVAILABLE, 
                //"case": -1, // which prescription is picked
                "dispenseStop": 0
                }
            }
            break;

        case PATIENT_COMPLETE:
            //patient receives their medication and head home
            if (hasArrived){
                patient.state = PATIENT_REMOVE
		        var timeInPharmacy = currentTime - patient.timeRegistered;
                var stats;
                if (patient.status==2){
                    stats = statistics[0];
                    stats.cumulativeValue = stats.cumulativeValue+timeInPharmacy;
                    stats.count = stats.count+1;
                } else if (patient.status == 3){
                    stats = statistics[1];
                    stats.cumulativeValue = stats.cumulativeValue+timeInPharmacy;
                    stats.count = stats.count+1;
                }
                                
            }
            break;

        case PATIENT_REMOVE:
            // removes patient once they reach exit
            break;

        default:
        break;
    }

    // set the destination row and column
    var targetRow = patient.target.row;
    var targetCol = patient.target.col;
    // compute the distance to the target destination
    var rowsToGo = targetRow - row;
    var colsToGo = targetCol - col;
    // set the speed
    var cellsPerStep = 1;
    // compute the cell to move to
    var newRow = row + Math.min(Math.abs(rowsToGo),cellsPerStep)*Math.sign(rowsToGo);
    var newCol = col + Math.min(Math.abs(colsToGo),cellsPerStep)*Math.sign(colsToGo);
    // update the location of the patient
    patient.location.row = newRow;
    patient.location.col = newCol;
}

// updates prescription
function updatePrescription(prescriptionIndex){
	prescriptionIndex = Number(prescriptionIndex); 
    //prescription ID here would be the same as the patient's ID
	var prescription = prescriptions[prescriptionIndex];
    //console.log("pres id");
    //console.log(prescription.id);

    // get the current location of the prescription
	var row = prescription.location.row;
	var col = prescription.location.col;
	var state = prescription.state;
    //console.log("Prescription State: "+state)
    // determine if patient has arrived at destination
	var hasArrived = (Math.abs(prescription.target.row-row)+Math.abs(prescription.target.col-col))==0;

    var missedPresStats = statistics[5]

    switch(state){
        case PRESCRIPTION_UNREGISTERED:
            // This is depricated as prescriptions are made upon registration
            break;

        case PRESCRIPTION_REGISTERED:
            switch(prescription.status){
                case QPRIORITY:{
                    prescription.state = PRESCRIPTION_PRIORITYQUEUE;
                    prescription.target.row = LOCpriorityQueueRow;
                    prescription.target.col = LOCpriorityQueueCol;
                    missedPresStats.count = missedPresStats.count+1;
                    break;
                }
                case QNORMAL:{
                    prescription.state = PRESCRIPTION_NORMALQUEUE;
                    prescription.target.row = LOCnormalQueueRow;
                    prescription.target.col = LOCnormalQueueCol;
                    missedPresStats.count = missedPresStats.count+1;
                    break;
                }
                case QDELIVERY:{
                    prescription.state = PRESCRIPTION_DELIVERYQUEUE;
                    prescription.target.row = LOCdeliveryQueueRow;
                    prescription.target.col = LOCdeliveryQueueCol;
                    break;
                }
            }
            //console.log("Prescription State: "+prescription.state)
            break;

        case PRESCRIPTION_PRIORITYQUEUE:
            // start picking if queue number is called and make sure picker is available
            if (prescription.qnumber == QUEUE_PRIORITY_CALL && 
                picker.state == PICKER_AVAILABLE){
                // prepare next queue number
                QUEUE_PRIORITY_CALL ++
                // change state and target of prescription
                prescription.state = PRESCRIPTION_PICKING
                prescription.target.row = LOCpickingRow
                prescription.target.col = LOCpickingCol
                // change state and stop time of picker
                picker.state = PICKER_BUSY
                picker.pickStop = currentTime + pickerMEAN + stdNormalDistribution()*pickerSD;

            }
            //console.log("Picker State: "+picker.state)
            break;
        
        case PRESCRIPTION_NORMALQUEUE:
            // start picking if queue number is called, no queue in priority 
            //and make sure picker is available
            if (prescription.qnumber == QUEUE_NORMAL_CALL && 
                prescriptions.filter(prescription => prescription.state == PRESCRIPTION_PRIORITYQUEUE).length == 0 &&
                picker.state == PICKER_AVAILABLE){
                // prepare next queue number
                QUEUE_NORMAL_CALL ++
                // change state and target of prescription
                prescription.state = PRESCRIPTION_PICKING
                prescription.target.row = LOCpickingRow
                prescription.target.col = LOCpickingCol
                // change state and stop time of picker
                picker.state = PICKER_BUSY
                picker.pickStop = currentTime + pickerMEAN + stdNormalDistribution()*pickerSD;

            }
            break;

        case PRESCRIPTION_DELIVERYQUEUE:
            // start picking if queue number is called, no queue in priority OR normal
            //and make sure picker is available
            if (prescription.qnumber == QUEUE_DELIVERY_CALL && 
                prescriptions.filter(prescription => prescription.state == PRESCRIPTION_PRIORITYQUEUE || prescription.state == PRESCRIPTION_NORMALQUEUE).length == 0 &&
                picker.state == PICKER_AVAILABLE){
                // prepare next queue number
                QUEUE_DELIVERY_CALL ++
                // change state and target of prescription
                prescription.state = PRESCRIPTION_PICKING
                prescription.target.row = LOCpickingRow
                prescription.target.col = LOCpickingCol
                // change state and stop time of picker
                picker.state = PICKER_BUSY
                picker.pickStop = currentTime + pickerMEAN + stdNormalDistribution()*pickerSD;

            }
            break;


        case PRESCRIPTION_PICKING:
            // goes to next step if its pickstop exceeds the time and prescription arrives at picker
            if (currentTime >= picker.pickStop && hasArrived){
                // send to delivery office for QDELIVERY
                if (prescription.status == QDELIVERY){
                    prescription.state = PRESCRIPTION_DELIVERY
                    prescription.target.row = LOCdeliveryOfficeRow
                    prescription.target.col = LOCdeliveryOfficeCol
                }
                // set queue state, target and row
                else{
                    prescription.state = PRESCRIPTION_PICKED
                    prescription.target.row = LOCstagingRow
                    prescription.target.col = LOCstagingCol
                    prescription.qnumber = QUEUE_STAGED_NEXT
                    QUEUE_STAGED_NEXT ++
                }
                // reset picker
                picker.state = PICKER_AVAILABLE
                picker.pickStop = -1

            }

            break;

        case PRESCRIPTION_PICKED:
            // changes to staging when it arrives at staging area            
            if (hasArrived){                
                prescription.state = PRESCRIPTION_STAGING
            }
            break;

        case PRESCRIPTION_STAGING: 
            // if qnumber is same as next prescription, and dispenser is not busy, call number
            if (dispenser.state == DISPENSER_AVAILABLE && 
                prescription.qnumber == QUEUE_STAGED_CALL){
                    // sets stuff up
                    dispenser.waitStop = currentTime + dispenserTolerance
                    dispenser.state = DISPENSER_WAITING

                    dispenser.id = prescription.id
                    QUEUE_STAGED_CALL++
                    if (prescription.status==2){ //NORMAL PRESCRIPTION TIME TO BE DISPENSED
                        var timePresNormal = currentTime - prescription.timeRegistered;
                        stats = statistics[2];
                        stats.cumulativeValue = stats.cumulativeValue+timePresNormal;
                        stats.count = stats.count+1
                    } else if (prescription.status==3){ //PRIORITY PRESCRIPTION TIME TO BE DISPENSED
                        var timePresPriority = currentTime - prescription.timeRegistered;
                        stats = statistics[3];
                        stats.cumulativeValue = stats.cumulativeValue+timePresPriority;
                        stats.count = stats.count+1}
            }
            // reaction exceeds counter tolerance, 
            // change patient and prescription to missed
            // note: dispenser will wait once patient starts walking
            else if (dispenser.state == DISPENSER_WAITING && 
                currentTime > dispenser.waitStop &&
                dispenser.id == prescription.id){

                prescription.state = PRESCRIPTION_TRANSFER
                prescription.target.row = LOCmissedstagingRow
                prescription.target.col = LOCmissedstagingCol

                // change state and target of prescription
                var patientIdx = patients.findIndex(patient => prescription.id == patient.id)
                if (patientIdx != -1){
                    patients[patientIdx].state = PATIENT_TRANSFER
                    patients[patientIdx].target.row = LOCmissedQueueRow
                    patients[patientIdx].target.col = LOCmissedQueueCol
                }

                //reset dispenser
                dispenser = {"state":DISPENSER_AVAILABLE, 
                "id": -1, 
                "waitStop": 0,
                "dispenseStop": 0,
                }

            }
            break;

        case PRESCRIPTION_TRANSFER:
            // enters this state by updatePatient
            if (hasArrived){
                prescription.state = PRESCRIPTION_MISSEDSTAGING
                missedPresStats.cumulativeValue += 100
            }
            break;

        case PRESCRIPTION_MISSEDSTAGING:
            // nothing happens here
            // this state is used by updatePatient to ensure prescription has reached missedStaging
            break;

        case PRESCRIPTION_DELIVERY:
            // enters this state by updateDispenser
            // target location will be delivery office
            if (hasArrived){
                prescription.state = PRESCRIPTION_REMOVE
                var timePresDelivery = currentTime - prescription.timeRegistered;
                stats = statistics[4];
                stats.cumulativeValue = stats.cumulativeValue+timePresDelivery;
                stats.count = stats.count + 1
            }
            break;

        case PRESCRIPTION_REMOVE:
            break;

        default:
            break;

    }

    // set the destination row and column
    var targetRow = prescription.target.row;
    var targetCol = prescription.target.col;
    // compute the distance to the target destination
    var rowsToGo = targetRow - row;
    var colsToGo = targetCol - col;
    // set the speed
    var cellsPerStep = 1;
    // compute the cell to move to
    var newRow = row + Math.min(Math.abs(rowsToGo),cellsPerStep)*Math.sign(rowsToGo);
    var newCol = col + Math.min(Math.abs(colsToGo),cellsPerStep)*Math.sign(colsToGo);
    // update the location of the patient
    prescription.location.row = newRow;
    prescription.location.col = newCol;

}

function removeDynamicAgents(){
	// We need to remove patients who have been discharged. 
	//Select all svg elements of class "patient" and map it to the data list called patients
	var allpatients = surface.selectAll(".patient").data(patients);
	//Select all the svg groups of class "patient" whose state is EXITED
	var treatedpatients = allpatients.filter(function(d,i){return d.state==PATIENT_REMOVE;});
	// Remove the svg groups of EXITED patients: they will disappear from the screen at this point
	treatedpatients.remove();
	
	// Remove the EXITED patients from the patients list using a filter command
	patients = patients.filter(function(d){return d.state!=PATIENT_REMOVE;});

    //Select all svg elements of class "prescription" and map it to the data list called prescriptions
	var allprescriptions = surface.selectAll(".prescription").data(prescriptions);
	//Select all the svg groups of class "prescription" whose state is EXITED
	var dispensedprescriptions = allprescriptions.filter(function(d,i){return d.state==PRESCRIPTION_REMOVE;});
	// Remove the svg groups of EXITED prescriptions: they will disappear from the screen at this point
	dispensedprescriptions.remove();

    // Remove the EXITED prescriptions from the prescriptions list using a filter command
	prescriptions = prescriptions.filter(function(d){return d.state!=PRESCRIPTION_REMOVE;});
	// At this point the patients list should match the images on the screen one for one 
	// and no patients should have state EXITED
}



function updateDynamicAgents(){
	// loop over all the agents and update their states
	for (var patientIndex in patients){
		updatePatient(patientIndex);
	}
    //console.log("Seats: ");
    //console.log(waitingSeats);
   
    for (var prescriptionIndex in prescriptions){
		updatePrescription(prescriptionIndex);
	}

    // set queue length
    queues[0].length = patients.filter(function(d){return d.state == PATIENT_UNREGISTERED}).length
    queues[1].length = prescriptions.filter(function(d){return d.state == PRESCRIPTION_PRIORITYQUEUE}).length
    queues[2].length = prescriptions.filter(function(d){return d.state == PRESCRIPTION_NORMALQUEUE}).length
    queues[3].length = prescriptions.filter(function(d){return d.state == PRESCRIPTION_DELIVERYQUEUE}).length
    queues[4].length = prescriptions.filter(function(d){return d.state == PRESCRIPTION_STAGING}).length
    queues[5].length = prescriptions.filter(function(d){return d.state == PRESCRIPTION_MISSEDSTAGING}).length
    queues[6].length = patients.filter(function(d){return d.state == PATIENT_MISSEDQUEUE}).length

    console.log("Patients: ");
    console.log(patients);

    console.log("Prescriptions: ");
    console.log(prescriptions);

    console.log("Picker: ");
    console.log(picker);

    console.log("Dispenser: ");
    console.log(dispenser);

    console.log("mDispenser: ");
    console.log(mdispenser);

    console.log("CurrentTime: ");
    console.log(currentTime);
    // console.log(patients.id);
    //console.log("Prescriptions: "+prescriptions)
    //console.log("Patients: "+patients)
	updateSurface();	
}

function simStep(){
	//This function is called by a timer; if running, it executes one simulation step 
	//The timing interval is set in the page initialization function near the top of this file
	if (isRunning){ //the isRunning variable is toggled by toggleSimStep
		// Increment current time (for computing statistics)
		currentTime++;
		// Sometimes new agents will be created in the following function
		addDynamicAgents();
		// In the next function we update each agent
		updateDynamicAgents();
		// Sometimes agents will be removed in the following function
		removeDynamicAgents();
	}
}
