//status for prescription or 
const DELIVERYQ=1;
const NORMALQ=2;
const PRIORITYQ=3;

// state of a patient in the hospital
const PATIENT_UNREGISTERED=0;
const PATIENT_REGISTERED=1;
const PATIENT_CALLED=2;
const PATIENT_WALKING=3; 
const PATIENT_RECEIVING =4;
const PATIENT_MISSEDWALKING=5;
const PATIENT_MISSEDQUEUE = 6;
const PATIENT_REACHEDMISSEDCOUNTER = 7;
const PATIENT_MISSEDRECEIVING = 8;
const PATIENT_COMPLETE=9;
const PATIENT_REMOVE = 10;

// queue count
// Get queue count using filter
/* var QUEUE_REGISTRATION = 0;
var QUEUE_DELIVERY = 0;
var QUEUE_NORMAL = 0;
var QUEUE_PRIORITY = 0;
var QUEUE_MISSED = 0; */


// state of a prescription in the hospital
const PRESCRIPTION_UNREGISTERED=0;
const PRESCRIPTION_REGISTERED=1;
const PRESCRIPTION_PRIORITYQUEUE=2; 
const PRESCRIPTION_NORMALQUEUE =3;
const PRESCRIPTION_DELIVERYQUEUE=4;
const PRESCRIPTION_PICKED=5;
const PRESCRIPTION_STAGING = 6;
const PRESCRIPTION_TRANSFER = 7;
const PRESCRIPTION_MISSEDSTAGING = 8;
const PRESCRIPTION_DELIVERY = 9;
const PRESCRIPTION_REMOVE = 10;

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

// Holding List for Patient and Prescription Information
var patients = [];
var prescriptions = [];

// Fixed number of dispensers and missed dispensers
var dispenser = {status:DISPENSER_AVAILABLE, 
    case: -1, // which prescription is picked
    calledTime: 0
}

var mdispenser = {status:MDISPENSER_AVAILABLE, 
    case: -1, // which prescription is picked
}

var picker = {status:PICKER_AVAILABLE, 
    case: -1, // which prescription is picked
    timestart: 0,
    timeend: 0
}

// Patient ID Count
var NextPatientID = 1; // initialise the first patient ID with 1

// Probabilties
var ProbPatientDelivery = 0.4; // set the patient's likelihood to be a delivery patient
var ProbPatientPriority = 0.4; // set the patient's likelihood to be a priority patient given its non-delivery
var ProbReact = 0.90; // probability patient responds when number is called
function stdNormalDistribution (x) {
    return Math.pow(Math.E,-Math.pow(x,2)/2)/Math.sqrt(2*Math.PI);
}

//Variables for Output Analysis
var DeliveryTotal = 0; // record the cumulative totals for deliveries
var CompletedTotal = 0; // record cumulative total patients served (inc delivery)

// Location Consts
// change when coding gui
const LOCreceptionistRow = 0
const LOCreceptionistCol = 0

//prescription
const LOCdeliveryQueueRow = 0
const LOCdeliveryQueueCol = 0
const LOCnormalQueueRow = 0
const LOCnormalQueueCol = 0
const LOCpriorityQueueRow = 0
const LOCpriorityQueueCol = 0

//prescription
const LOCpickingRow = 0
const LOCpickingCol = 0
const LOCstagingRow = 0
const LOCstagingCol = 0

const LOCcounterRow = 0
const LOCcounterCol = 0

const LOCmissedQueueRow = 0
const LOCmissedQueueCol = 0
const LOCmissedstagingRow = 0 //prescription
const LOCmissedstagingCol = 0 //prescription
const LOCmissedCounterRow = 0
const LOCmissedCounterCol = 0

const LOCexitRow = 0
const LOCexitCol = 0
const LOCdeliveryOfficeRow = 0
const LOCdeiveryOfficeCol = 0


function addDynamicAgents(){
	// Patients are dynamic agents: they enter the clinic, wait, get treated, and then leave
	// We have entering patients of two types "A" and "B"
	// We could specify their probabilities of arrival in any simulation step separately
	// Or we could specify a probability of arrival of all patients and then specify the probability of a Type A arrival.
	// We have done the latter. probArrival is probability of arrival a patient and probTypeA is the probability of a type A patient who arrives.
	// First see if a patient arrives in this sim step.

    // Prescription will be added at registration
	if (Math.random()< probArrival){
        // patient tolerance with miu = 1000 and sd = 10
        // Note: time is every refresh on screen, im not sure what correlation it has with real time
        pat_tolerance = 1000 + stdNormalDistribution*10
		var newpatient = {
            "id":NextPatientID,
            "status":"DELIVERY",
            "location":{"row":1,"col":1},
            "target":{"row":receptionistRow,"col":receptionistCol},
            "state":PATIENT_UNREGISTERED,
            "timeRegistered":0,
            "tolerance":pat_tolerance,
            "seatNum": -1};
		if (Math.random()<ProbPatientDelivery) newpatient.status = "DELIVERY";
		else if (Math.random()<ProbPatientPriority) newpatient.status = "PRIORITY"
        else newpatient.status = "NORMAL"
		patients.push(newpatient);
        NextPatientID += 1
	}
	
}

//update patient state
function updatePatient(patientIndex){
	//patientID is an index into the patients data array
	patientIndex = Number(patientIndex); //it seems patientID was coming in as a string
	var patient = patients[patientIndex];

	// get the current location of the patient
	var row = patient.location.row;
	var col = patient.location.col;
	var state = patient.state;
	
    // Constants for seat occupation
    const EMPTY = 0;
    const OCCUPIED = 1;
	
	// determine if patient has arrived at destination
	var hasArrived = (Math.abs(patient.target.row-row)+Math.abs(patient.target.col-col))==0;
	
	// Behavior of patient depends on his or her state
	switch(state){
		case PATIENT_UNREGISTERED:
            if (hasArrived){
                //if patient is "DELIVERY" send to 
                if (patient.status == "DELIVERY"){
                    patient.target.row = LOCexitRow;
                    patient.target.col = LOCexitCol;
                    patient.status = PATIENT_COMPLETE
                }
                else if (seatAvailable.length > 0){
                    patient.state = PATIENT_REGISTERED;
                    patient.timeRegistered = currentTime

                    //Assign seating
                    var seat = seatAvailable[Math.floor(Math.random() * seatAvailable.length)];
                    console.log(seat);
                    var seatChosen = Number(seat.seatNum);
                    console.log(seatChosen);

                    //chope the seat
                    waitingSeats[seatChosen].occupation = OCCUPIED;

                    //Update Targets
                    patient.target.row = seat.row;
                    patient.target.col = seat.col;

                    // Update seatNum into patient
                    patient.seatNum = seatChosen;

                    // Creates new prescription
                    prescriptions.push({
                        "id":patient.id,
                        "status":"DELIVERY",                            
                        "location":{"row":1,"col":1},//set location for prescription counter
                        "target":{"row":receptionistRow,"col":receptionistCol},
                        "state":PRESCRIPTION_REGISTERED,
                        "timeRegistered":0})

                    QUEUE_REGISTRATION ++ //to display on UI
                }
                    // Queue forms, but patient overlaps
                    // Since patient ID is generated sequentially, 
                    //the patient with the smaller number goes first
                    //effectively forming a queue
                    // NEED TO CHECK ABOVE REQUIREMENT!
            }
        break;

        case PATIENT_REGISTERED:
            //note: transition to PATIENT_CALLED state will be made by DISPENSER
            //goes home if waiting time exceeds 
            if (currentTime - patient.timeRegistered >= patient.tolerance){
                patient.target.row = LOCexitRow;
                patient.target.col = LOCexitCol;
                patient.status = PATIENT_COMPLETE
            }
            break;

        case PATIENT_CALLED:
            // Reacts sometimes when being called
            if (Math.random()<ProbReact){
                patient.target.row = LOCcounterRow;
                patient.target.col = LOCcounterCol;
                patient.state = PATIENT_WALKING;
            }

        case PATIENT_WALKING:
            if (hasArrived){
                //transition to PATIENT_REACHED
                patient.state = PATIENT_REACHEDCOUNTER;
                // Activates dispenser
                dispenser.state = DISPENSER_BUSY             
            }

        case PATIENT_RECEIVING:
            // Actually nothing much happens here haha
            //patient will be updated to PATIENT_COMPLETE by updatedispenser()
            break;

        case PATIENT_MISSEDWALKING:
            // this state will be set by updatedispenser()
            if (hasArrived){
                //transition to PATIENT_REACHED
                patient.state = PATIENT_MISSEDQUEUE;        
            }
            break;

        case PATIENT_MISSEDQUEUE:
            // nothing happens here
            //transitions will be updated by updatemdispenser            
            break;

        case PATIENT_REACHEDMISSEDCOUNTER:
            // patient goes to the missed queue counter
            patient.state =  PATIENT_REACHEDMISSEDRECEIVING;
            patients.push(patient.state);
            break;

        case PATIENT_MISSEDRECEIVING:
            // Actually nothing much happens here haha
            //patient will be updated to PATIENT_COMPLETE by updatemdispenser()
            break;

        case PATIENT_COMPLETE:
            //patient receives their medication and head home
            if (hasArrived){
                patient.status = PATIENT_REMOVE
            }
            break;

        case PATIENT_REMOVE:
            // removes patient once they reach exit
            break;
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
function updatePrescription(prescriptionID){
	prescriptionID = Number(prescriptionID); 
    //prescription ID here would be the same as the patient's ID
	var prescription = prescription[prescriptionID];

    // get the current location of the patient
	var row = patient.location.row;
	var col = patient.location.col;
	var state = patient.state;

    // determine if patient has arrived at destination
	var hasArrived = (Math.abs(prescription.target.row-row)+Math.abs(prescription.target.col-col))==0;

    switch(state){
        case PRESCRIPTION_UNREGISTERED:
            // This is depricated as prescriptions are made upon registration
            break;

        case PRESCRIPTION_REGISTERED:
            switch(prescription.status){
                case "PRIORITY":{
                    prescription.state = PRESCRIPTION_PRIORITYQUEUE
                    prescription.target.row = LOCpriorityQueueRow
                    prescription.target.row = LOCpriorityQueueCol
                }
                case "NORMAL":{
                    prescription.state = PRESCRIPTION_NORMALQUEUE
                    prescription.target.row = LOCnormalQueueRow
                    prescription.target.row = LOCnormalQueueCol
                }
                case "DELIVERY":{
                    prescription.state = PRESCRIPTION_DELIVERYQUEUE
                    prescription.target.row = LOCdeliveryQueueRow
                    prescription.target.row = LOCdeliveryQueueCol
                }
            }
            break;

        case PRESCRIPTION_PRIORITYQUEUE:
            // nothing happens, to be activated by updatepicker
            // NOTE: prescription does not need to arrive at queue to be picked
            break;
        
        case PRESCRIPTION_NORMALQUEUE:
            // nothing happens, to be activated by updatepicker
            // NOTE: prescription does not need to arrive at queue to be picked
            break;

        case PRESCRIPTION_DELIVERYQUEUE:
            // nothing happens, next step is activated by updatepicker
            // NOTE: prescription does not need to arrive at queue to be picked
            break;

        case PRESCRIPTION_PICKED:
            // state set by picker
            // target location will be staging area
            if (hasArrived){
                prescription.state = PRESCRIPTION_STAGING
            }
            break;

        case PRESCRIPTION_STAGING:
            // nothing happens, next step is activated by updatedispenser
            break;

        case PRESCRIPTION_TRANSFER:
            // enters this state by updatedispenser
            // target location will be missed staging area
            if (hasArrived){
                prescription.state = PRESCRIPTION_MISSEDSTAGING
            }
            break;

        case PRESCRIPTION_MISSEDSTAGING:
            // enters this state by updatedispenser
            // nothing happens here, next step is activated by updatemdispenser
            break;

        case PRESCRIPTION_DELIVERY:
            // enters this state by updatedispenser
            // target location will be delivery office
            if (hasArrived){
                prescription.state = PRESCRIPTION_REMOVE
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


function updateDynamicAgents(){
	// loop over all the agents and update their states
	for (var patientIndex in patients){
		updatePatient(patientIndex);
	}
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