// import constants from constants.js file
import './constants'

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

// Fixed number of dispensers and missed dispensers
var dispenser = {"state":DISPENSER_AVAILABLE, 
    //"case": -1, // which prescription is picked
    "calledTime": 0,
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

//to set up waiting seats
// Dynamic array for seats
var waitingSeats = [];
var iterate = 0;
for(r = LOCseatstartrow; r < LOCseatendrow; r++) {
	for(c = LOCseatstartcol; c < LOCseatendcol; c++) {
		var seatstate={'row': r, 'col': c, 'occupation': Number(EMPTY), 'seatNum': iterate}
		waitingSeats.push(seatstate);
		iterate++;
	}
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
            "status":"DELIVERY",
            "location":{"row":1,"col":1},
            "target":{"row":receptionistRow,"col":receptionistCol},
            "state":PATIENT_UNREGISTERED,
            "timeRegistered":0, // to check if patient will leave or not
            "tolerance":pat_tolerance,
            "seatNum": -1,
            "missedq": -1};
		if (Math.random()<ProbPatientDelivery) newpatient.status = QDELIVERY;
		else if (Math.random()<ProbPatientPriority) newpatient.status = QPRIORITY;
        else newpatient.status = QNORMAL;
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

                    // settings for prescription
                    qnumber = QUEUE_DELIVERY_NEXT
                    QUEUE_DELIVERY_NEXT ++

                    prescriptions.push({
                        "id":patient.id,
                        "status":patient.status,                            
                        "location":{"row":1,"col":1},//set location for prescription counter
                        "target":{"row":receptionistRow,"col":receptionistCol},
                        "state":PRESCRIPTION_REGISTERED,
                        "qnumber":qnumber})
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

                    // sets up queue number
                    var qnumber

                    if (patient.status == QPRIORITY){
                        qnumber = QUEUE_PRIORITY_NEXT
                        QUEUE_PRIORITY_NEXT ++
                    }
                    else if (patient.status == QNORMAL){
                        qnumber = QUEUE_NORMAL_NEXT
                        QUEUE_NORMAL_NEXT ++
                    }                   

                    // Creates new prescription
                    prescriptions.push({
                        "id":patient.id,
                        "status":patient.status,                            
                        "location":{"row":1,"col":1},//set location for prescription counter
                        "target":{"row":receptionistRow,"col":receptionistCol},
                        "state":PRESCRIPTION_REGISTERED,
                        "qnumber":qnumber})
                    
                }

                    // Queue forms, but patient overlaps
                    // Since patient ID is generated sequentially, 
                    // the patient with the smaller number goes first
                    // effectively forming a queue
                    // NEED TO CHECK ABOVE REQUIREMENT!
            }
        break;

        case PATIENT_REGISTERED:
            //note: transition to PATIENT_CALLED state will be made in updateprescription
            //goes home if waiting time exceeds 
            if (currentTime - patient.timeRegistered >= patient.tolerance){
                patient.target.row = LOCexitRow;
                patient.target.col = LOCexitCol;
                patient.status = PATIENT_COMPLETE
            }

            break;

        case PATIENT_CALLED:
            //note: transition to PATIENT_CALLED state will be made in updateprescription
            // Reacts sometimes when being called
            if (Math.random()<ProbReact){
                // set target and state
                patient.target.row = LOCcounterRow;
                patient.target.col = LOCcounterCol;
                patient.state = PATIENT_WALKING;

                // makes seat empty
                if (patient.seatNum != -1) waitingSeats[patient.seatNum].occupation = Number(EMPTY);
				patient.seatNum = -1
            }
            // reaction exceeds counter tolerance, 
            // change patient and prescription to missed
            // note: dispenser will wait once patient starts walking
            else if (currentTime-dispenser.calledTime > dispenserTolerance){
                // change state and target of prescription
                prescriptionIdx = prescriptions.findIndex(prescription => prescription.id == patient.id)
                prescriptions[prescriptionIdx].state = PRESCRIPTION_TRANSFER
                prescriptions[prescriptionIdx].target.Row = LOCmissedstagingRow
                prescriptions[prescriptionIdx].target.Col = LOCmissedstagingCol
                // change state and target of patient
                patient.state = PATIENT_TRANSFER
                patient.target.row = LOCmissedQueueRow
                patient.target.col = LOCmissedQueueCol
                //reset dispenser
                dispenser = {"state":DISPENSER_AVAILABLE, 
                //"case": -1, // which prescription is picked
                "calledTime": 0,
                "dispenseStop": 0,
                }
            }

        case PATIENT_WALKING:
            if (hasArrived){
                //transition to PATIENT_REACHED
                patient.state = PATIENT_RECEIVING;
                // Activates dispenser
                dispenser.state = DISPENSER_BUSY
                dispenser.dispenseStop = currentTime + dispenserMEAN + stdNormalDistribution()*dispenserSD;
            }

        case PATIENT_RECEIVING:
            // updates only when dispensing reaches the end
            if (currentTime >= dispenser.dispenseStop){
                // remove prescription
                prescriptionIdx = prescriptions.findIndex(prescription => prescription.id == patient.id)
                prescriptions[prescriptionIdx].state = PRESCRIPTION_REMOVE
                // set patient for exit
                patient.state = PATIENT_COMPLETE
                patient.target.row = LOCexitRow
                patient.target.col = LOCexitCol

                //reset dispenser
                dispenser = {"state":DISPENSER_AVAILABLE, 
                //"case": -1, // which prescription is picked
                "calledTime": 0,
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
            if (hasArrived && 
                prescriptions.findIndex(prescription => prescription.id == patient.id)[0].state == PRESCRIPTION_MISSEDSTAGING){
                patient.state =  PATIENT_MISSEDRECEIVING;
                mdispenser.dispenseStop = currentTime + dispenserMEAN + stdNormalDistribution()*dispenserSD;
            }            
            break;

        case PATIENT_MISSEDRECEIVING:
            if (currentTime >= mdispenser.dispenseStop){
                // remove prescription
                prescriptionIdx = prescriptions.filter(prescription => prescription.id == patient.id)
                prescriptions[prescriptionIdx].state = PRESCRIPTION_REMOVE

                // set patient for exit
                patient.state = PATIENT_COMPLETE
                patient.target.row = LOCexitRow
                patient.target.col = LOCexitCol

                //reset dispenser
                mdispenser = {"state":MDISPENSER_AVAILABLE, 
                //"case": -1, // which prescription is picked
                //"calledTime": 0,
                "dispenseStop": 0
                }
            }
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
function updatePrescription(prescriptionIndex){
	prescriptionIndex = Number(prescriptionIndex); 
    //prescription ID here would be the same as the patient's ID
	var prescription = prescriptions[prescriptionIndex];

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
            // start picking if queue number is called and make sure picker is available
            if (presciption.qnumber == QUEUE_PRIORITY_CALL && 
                picker.state == PICKER_AVAILABLE){
                // prepare next queue number
                QUEUE_PRIORITY_CALL ++
                // change state and target of prescription
                prescription.state = PRESCRIPTION_PICKING
                prescription.target.Row = LOCpickingRow
                prescription.target.Col = LOCpickingCol
                // change state and stop time of picker
                picker.state = PICKER_BUSY
                picker.pickStop = currentTime + pickerMEAN + stdNormalDistribution()*pickerSD

            }
            break;
        
        case PRESCRIPTION_NORMALQUEUE:
            // start picking if queue number is called, no queue in priority 
            //and make sure picker is available
            if (presciption.qnumber == QUEUE_NORMAL_CALL && 
                prescriptions.filter(prescription => prescription.state == PRESCRIPTION_PRIORITYQUEUE).length == 0 &&
                picker.state == PICKER_AVAILABLE){
                // prepare next queue number
                QUEUE_NORMAL_CALL ++
                // change state and target of prescription
                prescription.state = PRESCRIPTION_PICKING
                prescription.target.Row = LOCpickingRow
                prescription.target.Col = LOCpickingCol
                // change state and stop time of picker
                picker.state = PICKER_BUSY
                picker.pickStop = currentTime + pickerMEAN + stdNormalDistribution()*pickerSD

            }
            break;

        case PRESCRIPTION_DELIVERYQUEUE:
            // start picking if queue number is called, no queue in priority OR normal
            //and make sure picker is available
            if (presciption.qnumber == QUEUE_DELIVERY_CALL && 
                prescriptions.filter(prescription => prescription.state == PRESCRIPTION_PRIORITYQUEUE || prescription.state == PRESCRIPTION_NORMALQUEUE).length == 0 &&
                picker.state == PICKER_AVAILABLE){
                // prepare next queue number
                QUEUE_DELIVERY_CALL ++
                // change state and target of prescription
                prescription.state = PRESCRIPTION_PICKING
                prescription.target.Row = LOCpickingRow
                prescription.target.Col = LOCpickingCol
                // change state and stop time of picker
                picker.state = PICKER_BUSY
                picker.pickStop = currentTime + pickerMEAN + stdNormalDistribution()*pickerSD

            }
            break;


        case PRESCRIPTION_PICKING:
            // goes to next step if its pickstop exceeds the time and prescription arrives at picker
            if (currentTime >= picker.pickStop && hasArrived){
                if (prescription.status == QDELIVERY){
                    prescription.state = PRESCRIPTION_STAGING
                    prescription.target.row = LOCdeliveryOfficeRow
                    prescription.target.Col = LOCdeliveryOfficeCol
                }
                else{
                    prescription.state = PRESCRIPTION_PICKED
                    prescription.target.row = LOCstagingRow
                    prescription.target.Col = LOCstagingCol
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
                prescription.qnumber = QUEUE_STAGED_NEXT
                QUEUE_STAGED_NEXT++
            }
            break;

        case PRESCRIPTION_STAGING: 
            // if qnumber is same as next prescription, and dispenser is not busy, call number
            if (dispenser.state == DISPENSER_AVAILABLE && 
                prescription.qnumber == QUEUE_STAGED_CALL){
                    dispenser.calledTime = currentTime
                    patientIdx = patients.findIndex(patient => patient.id == prescription.id)
                    patients[patientIdx].state = PATIENT_CALLED
                    QUEUE_STAGED_CALL++
            }
            break;

        case PRESCRIPTION_TRANSFER:
            // enters this state by updatePatient
            if (hasArrived){
                prescription.state = PRESCRIPTION_MISSEDSTAGING
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
	var treatedpatients = allpatients.filter(function(d,i){return d.state==EXITED;});
	// Remove the svg groups of EXITED patients: they will disappear from the screen at this point
	treatedpatients.remove();
	
	// Remove the EXITED patients from the patients list using a filter command
	patients = patients.filter(function(d){return d.state!=PATIENT_REMOVED;});

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
        console.log(patients)
	}
    for (var prescriptionIndex in prescriptions){
		updatePrescription(prescriptionIndex);
        console.log(prescriptions)
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