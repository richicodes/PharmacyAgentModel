//status for prescription or 
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

//wait time probabilities
const pickerMEAN = 100
const pickerSD = 10
//note: same parameters for both dispenser and mdispenser
const dispenserMEAN = 50
const dispenserSD = 10
const patientMEAN = 1000
const patientSD = 10

// fixed dispenser tolerance
const dispenserTolerance = 300

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
const LOCdeliveryOfficeCol = 0

const LOCseatstartrow = 0
const LOCseatendrow = 0
const LOCseatstartcol = 0
const LOCseatendcol = 0