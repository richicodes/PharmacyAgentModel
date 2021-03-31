//status for prescription or 
const DELIVERYQ=1;
const NORMALQ=2;
const PRIORITYQ=3;

// state of a patient in the hospital
const PATIENT_UNREGISTERED=0;
const PATIENT_REGISTERED=1;
const PATIENT_CALLED=2;
const PATIENT_WALKING=3; 
const PATIENT_REACHEDCOUNTER =4;
const PATIENT_RECEIVING=5;
const PATIENT_MISSEDQUEUE = 6;
const PATIENT_REACHEDMISSEDCOUNTER = 7;
const PATIENT_MISSEDRECEIVING = 8;
const PATIENT_COMPLETE=9;
const PATIENT_REMOVE = 10;

// registration queue count
var REGISTRATION_QUEUE

// state of a prescription in the hospital
const PRESCRIPTION_UNREGISTERED=0;
const PRESCRIPTION_REGISTERED=1;
const PRESCRIPTION_PRIORITYQUEUE=2; 
const PRESCRIPTION_NORMALQUEUE =3;
const PRESCRIPTION_DELIVERYQUEUE=4;
const PRESCRIPTION_PICKED=5;
const PRESCRIPTION_STAGING = 6;
const PRESCRIPTION_MISSEDSTAGING = 7;
const PRESCRIPTION_COMPLETE = 8;
const PRESCRIPTION_REMOVE = 9;

// state of a general dispenser in the hospital
const DISPENSER_AVAILABLE=0;
const DISPENSER_WAITING=1;
const DISPENSER_BUSY=2; 

// state of a dispenser in the missed queue in the hospital
const MDISPENSER_AVAILABLE=0;
const MDISPENSER_BUSY=1; 

//update patient state
function updatePatient(patientID){
	//patientID is an index into the patients data array
	patientID = Number(patientID); //it seems patientID was coming in as a string
	var patient = patients[patientID];
	// get the current location of the patient
	var row = patient.location.row;
	var col = patient.location.col;
	var state = patient.state;
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
                    if (seatAvailable.length > 0){
                        patient.timeAdmitted = currentTime;
                        patient.state = WAITING;

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

                        // Update state of corresponding prescription
                        prescription[patientID].state

                    }
                    else {
                        // Queue forms, but patient overlaps
                        // Since patient ID is generated sequentially, 
                        //the patient with the smaller number goes first
                        //effectively forming a queue
                        REGISTRATION_QUEUE += 1 //to display on UI
                    }
            }
        break;
        case DISCHARGED:
            if (hasArrived){
                patient.state = EXITED;
            }
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