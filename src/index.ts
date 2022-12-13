import "../styles.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import Swal from "sweetalert2";
import { MyEvent } from "./interfaces/myevent";
const eventTemplate = require("../templates/event.handlebars");
import { EventService } from "./classes/event-service.class";
import { AuthService } from "./classes/auth-service.class";

let events: MyEvent[] = null;
const eventService = new EventService();
const authService = new AuthService();
let eventsContainer: HTMLDivElement = null;


window.addEventListener("load", () => {
    checkToken();
    eventsContainer = document.getElementById("eventsContainer") as HTMLDivElement;
    document.getElementById("logout").addEventListener("click", () => authService.logout());
    
    getEvents();

    const searchInput: HTMLInputElement = document.getElementById("search") as HTMLInputElement;
    document.getElementById("orderPrice").addEventListener("click", e => {
        e.preventDefault();
        searchInput.value = ""; //deletes any content in search input
        events.sort((e1, e2) => e1.price - e2.price); //from lowest to highest
        showEvents(events);
    });

    document.getElementById("orderDate").addEventListener("click", e => {
        e.preventDefault();
        searchInput.value = "";
        events.sort((e1, e2) => e1.date.localeCompare(e2.date)); //from older no newer dates
        showEvents(events);
    });

    searchInput.addEventListener("keyup", () => {
        const filtered = events.filter(e =>
            e.title.toLocaleLowerCase().includes(searchInput.value.toLocaleLowerCase()) ||
            e.description.toLocaleLowerCase().includes(searchInput.value.toLocaleLowerCase()));
        showEvents(filtered);
    });
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


//promise that gets events from server
async function getEvents(): Promise<void>{
    try {
        events = await eventService.getEvents();
        showEvents(events);
    } catch(e) {
        console.error(e);
        Swal.fire("Error!", "Unable to load the events.", "error");
    }    
}


//deletes previous content and adds events calling insert.
function showEvents(events: MyEvent[]): void {
    eventsContainer.replaceChildren(...events.map(e => insert(e)));
}


//inserts each event in to a new div
function insert(event: MyEvent): HTMLDivElement {
    const newDiv = document.createElement("div");
    newDiv.setAttribute("class", "col");

    //Copy of the event object with formated distance, date and price
    const eventJSON = {
        ...event,
        distance: new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(event.distance),
        date: new Intl.DateTimeFormat("es-ES").format(new Date(event.date)),
        price: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(+event.price)
    };
    const eventCard = eventTemplate(eventJSON);
    newDiv.innerHTML = eventCard;

    //select the delete button and adds eventListener if it exists
    const deleteBtn = newDiv.querySelector(".btn-danger");   
    if (deleteBtn){ //cards that have the button, otherwise we would be trying to add eventListner to null
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
                            newDiv.remove();
                        } catch (e) {
                            console.error(e);
                            Swal.fire("Error", "Error deleting the event!", "error");
                        }
                    } 
                });
        });
    }

    //select and add eventlistener to the attend-button div
    const attendButton = newDiv.querySelector(".attend-button");
    attendButton.addEventListener("click", async () => {

        if (event.attend) { //if true = user is attending   
            
            try {
                await eventService.deleteAttend(event.id);
                event.attend = false; //not attending now
                event.numAttend --; // reduces attendees in 1

                // update the current view of the event, without updating events or refreshing page
                newDiv.querySelector(".attend-users").innerHTML = "<i class='fas fa-users'></i> " + (event.numAttend).toString();
                attendButton.innerHTML = "<i class=\"fas fa-thumbs-down\"></i> Not going";
                attendButton.setAttribute("class", "text-danger text-end m-0 attend-button");

            } catch(e) {
                console.error(e);
            }
        } else { //user not attending  
                  
            try {
                await eventService.postAttend(event.id);
                event.attend = true; //is attending now
                event.numAttend ++ ; // increases attendees in 1

                // update the current view of the event, without updating events or refreshing page
                newDiv.querySelector(".attend-users").innerHTML = "<i class='fas fa-users'></i> " + (event.numAttend).toString();
                attendButton.innerHTML = "<i class=\"fas fa-thumbs-up\"></i> I'm going";
                attendButton.setAttribute("class", "text-success text-end m-0 attend-button");

            } catch(e) {
                console.error(e);
            }
        }
    });
    
    return newDiv;
}