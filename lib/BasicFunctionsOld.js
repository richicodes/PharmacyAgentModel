//Begin by defining the global variables:

/* note to self (and richi): some of these are not actually global variables,
and may benefit from being changed to local variables inside their respective functions
*/

//to richi: i'm not too sure if using letters for the constant values might be problematic
//in javascript, i.e. const DELIVERYQ=A, so i decided to use '1' etc since it works 
// in the HW


//queue triage section <- currently unused
// const DELIVERYQ=1;
// const NORMALQ=2;
// const PRIORITYQ=3;

//job status (generic indicator)
const BUSY = 0;
const AVAILABLE = 1;

//patient status codes (using a different range of numbers to avoid conflicting)
const COMPLETE=10;
const WAITING=11;

// this variable (probDelivery) is shared by the reception function 
//(in deciding if it's delivery), and the queue triage section,
// (in deciding what type of queue it belongs to)
var probDelivery=0.6; 
var probPriority=0.3;
var probNormal=0.1;
//

//place all the patient-related variables here
var patients = [];
var patientID = 0;


//place all the prescription-related variables here
var prescriptions =[];
var prescriptionID = 0;

//place all the main dispenser-related variables here
var mainDispenser = [];

// for richi: here are some useful functions which i grabbed from the homework 2 code

/*

probSomething = 0.5;
if (Math.random()< probSomething){
//do something
}


*/

// Next, define the basic functions which are part of the queuing engine

//1: Pre-Arrival
//create prescription-patient pair here
function preArrival(){
    /*placed an error-correcting function here just in case - not sure if the
    prescription-patient pair will ever go out of sync
    */
    if (patientID!=prescriptionID)
    {
    patientID=prescriptionID
    }

    var patientID = {"ID":patientID++}
    patients.push(patientID);

    var prescriptionID = {"ID": prescriptionID++}
    prescriptions.push(prescriptionID);
    //iirc we're just updating the global patient/prescription list 
    //so no need to return anything ig?
    return null;
}

//2: Reception Area
function reception(){
    //decide if a patient is a delivery patient
    var deliverystatus = 0
    if (Math.random()< probDelivery){
    var deliverystatus = 0
    }

    else{
    var deliverystatus = 1
    }

    if (deliverystatus==1){
    var patientstatus = {"status":COMPLETE}
    patients.push(patientstatus);
    }
    else{
    var patientstatus = {"status":WAITING}
    patients.push(patientstatus);
    }
    return null;
}


function prescriptionQueues(){
    //first, we randomly decide whether each patient belongs to each category
    if (Math.random()<probPriority) {
            prescription.type = "Priority";

            if (Math.random()<probNormal) 
            prescription.type = "Normal";

            else prescription.type="Delivery";
            
        }
    // update the prescription variable accordingly
        prescriptions.push(prescription.type);
    return null;
}

// decided to write out part of this to more easily illustrate how the
// variables should look
function packingRoom(){
    //find out how many patients are in the priority queue
    //also, need to check whether the filter command works with "Priority"
    // or Priority
    var patientPriorityQ = patients.filter(function(d){
        return(d.prescription.type=="Priority")
    })

    var patientNormalQ = patients.filter(function(d){
        return(d.prescription.type=="Normal")
    })

    var patientDeliveryQ = patients.filter(function(d){
        return(d.prescription.type=="Delivery")
    })

    // perform each picking > staging > etc task in descending triage priority
    if(patientPriorityQ.length!=0)
    {

}

if(patientNormalQ.length!=0)
{
    
}

else
{

}

return;
}

function missedQueue(){
    // the "busy" status here probably needs to tie up with a constant above
    // basically sets the missed dispenser status, housed within "prescriptions"
    // to busy, and sets the prescription status to complete once done
    var misseddisp = {"Dispstatus": BUSY, "status": COMPLETE}
    prescriptions.push(misseddisp);
    // can probably add a random delay here to simulate the service time
    var misseddisp = {"DispStatus": AVAILABLE}
    prescriptions.push(misseddisp);
    return;
}


function mainCounter(){
    var maindispstatus = prescriptions.filter(function(d){
        return(d.prescription.Dispstatus==AVAILABLE)
    })

    while (maindispstatus!=AVAILABLE)
    {
        
    }

    return;
}


function pharmacy(){

    return;
}