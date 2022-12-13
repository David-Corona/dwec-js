import "../styles.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import Swal from "sweetalert2";
import { MyEvent } from "./interfaces/myevent";
import { EventService } from "./classes/event-service.class";
import { AuthService } from "./classes/auth-service.class";
const eventTemplate = require("../templates/event.handlebars");
const attendeesTemplate = require("../templates/attendees.handlebars");
import { MyMap } from "./classes/mymap.class";
import { User } from "./interfaces/user";

let myEvent: MyEvent = null;
const eventService = new EventService();
let eventContainer: HTMLDivElement = null;
let mapDiv: HTMLDivElement = null;
const authService = new AuthService();
let userList: HTMLUListElement = null;
let attendees: User[] = null;


window.addEventListener("load", () => {
    checkToken();
    document.getElementById("logout").addEventListener("click", () => authService.logout());
    eventContainer = document.getElementById("eventContainer") as HTMLDivElement;
    mapDiv = document.getElementById("map") as HTMLDivElement;
    userList = document.getElementById("userList") as HTMLUListElement;

    getEvent();
});


//checks token to see if user is logged in
async function checkToken(): Promise<void> {
    if (localStorage.getItem("token")){ //if there's a token stored in localStorage
        try { //check valid token
            await authService.checkToken(); //no error => valid token => logged in
        } catch(e) { //token is invalid, throws error
            console.error(e);
            location.assign("login.html"); //invalid token => login
            //Swal.fire("Error", e.message, "error");
        }
    } else { //no token
        location.assign("login.html"); //if no token => login
    }
}


async function getEvent(): Promise<void> {
    
    //search returns ?id=XX => split("id=") to divide substrings => [1] will be id
    const id = + window.location.search.split("id=")[1];

    //checks id has been saved, that there was an id in the url.
    if (id) {
        try {
            myEvent = await eventService.getEvent(id);
            insert(myEvent);
            loadMap(myEvent.lat, myEvent.lng);
            loadAttendees(myEvent.id);
        } catch(e) { //if there wasn't an event with that id in the server
            console.error(e);
            Swal.fire("(Error " + e.statusCode + ") " + e.error + ".", e.message, "error");
        }
    } else {
        location.assign("index.html"); //redirect to index if there's no id
    }
}

function insert(event: MyEvent): void {

    //Copy of the event object with formated distance, date and price
    const eventJSON = {
        ...event,
        distance: new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(event.distance),
        date: new Intl.DateTimeFormat("es-ES").format(new Date(event.date)),
        price: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(+event.price)
    };
    const eventCard = eventTemplate(eventJSON); 
    eventContainer.innerHTML = eventCard;

    //selects the delete button (if it exists) and adds eventListener.
    const deleteBtn = eventContainer.querySelector(".btn-danger");
    if (deleteBtn){ //check it has button, otherwise we would be trying to add eventListner to null
        deleteBtn.addEventListener("click", async () => {
            Swal.fire({
                icon: "warning", 
                title: "Are you sure?", 
                text: "It will be deleted from the database.", 
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No"
            })
                .then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await eventService.delete(event.id);
                            eventContainer.remove();
                            location.assign("index.html"); //redirect to index once deleted
                        } catch (e) {
                            console.error(e);
                            Swal.fire("Error", "Error deleting the event!", "error");
                        }
                    } 
                });
        });
    }

    const attendButton = eventContainer.querySelector(".attend-button");
    attendButton.addEventListener("click", async () => {
        if (event.attend) { //if true = user is attending            
            try {
                await eventService.deleteAttend(event.id);
                event.attend = false; //not attending now
                getEvent(); //update event
            } catch(e) {
                console.error(e);
            }
        } else { //user not attending           
            try {
                await eventService.postAttend(event.id);
                event.attend = true; //is attending now
                getEvent(); //update event
            } catch(e) {
                console.error(e);
            }
        }
    });
}

async function loadMap(lat: number, lng: number): Promise<void> {

    //create a new mapboxgl.Map object, which will show the map in the selected div.
    const myMap = new MyMap({ "latitude": lat, "longitude": lng }, mapDiv);
    myMap.loadMap();  

    //create a new marker on the event's location  
    myMap.createMarker({ "latitude": lat, "longitude": lng }, "red");

    //add a popup with the coords of the location
    myMap.addPopup({ "latitude": lat, "longitude": lng });
}

async function loadAttendees(id: number): Promise<void> {    
    try {
        attendees = await eventService.getAttendees(id);
        const attendeesCard = attendeesTemplate({users: attendees}); //sends the users as JSON to template
        userList.innerHTML = attendeesCard;
    } catch(e) {
        console.error(e);
        Swal.fire("Error!" , "Could not load attendees to the event", "error");
    }
}
