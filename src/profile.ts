import "../styles.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import Swal from "sweetalert2";
import { UserService } from "./classes/user-service.class";
import { AuthService } from "./classes/auth-service.class";
import { User } from "./interfaces/user";
import { MyMap } from "./classes/mymap.class";
const userTemplate = require("../templates/profile.handlebars");

let user: User = null;
const userService = new UserService();
const authService = new AuthService();
let divProfile: HTMLDivElement = null;
let mapDiv: HTMLDivElement = null;


window.addEventListener("load", () => {
    document.getElementById("logout").addEventListener("click", () => authService.logout());
    divProfile = document.getElementById("profile") as HTMLDivElement;
    mapDiv = document.getElementById("map") as HTMLDivElement;

    getUser();
});


async function getUser(): Promise<void> {

    //search returns ?id=XX => split("id=") to divide substrings => [1] will be id
    const id = + window.location.search.split("id=")[1];
    
    try {
        if (id) { //if there is a valid id, will get SERVER/users/id
            user = await userService.getUser(id);
        } else { //if no id, will call SERVER/users/me
            user = await userService.getUser();
        }
        insert(user);
        loadMap(user.lat, user.lng);
    } catch(e) { //invalid id, a user with this id doesn't exist in database
        console.error(e);
        Swal.fire("(Error " + e.statusCode + ") " + e.message + ".", "User not found!", "error")
            .then(() => {
                location.assign("index.html"); //redirect after showing message
            });
    }
}


function insert(user: User): void {

    //inserts the template with the user information
    const userCard = userTemplate(user); 
    divProfile.innerHTML = userCard;
}


async function loadMap(lat: number, lng: number): Promise<void> {

    //create a new mapboxgl.Map object, which will show the map in the selected div.
    const myMap = new MyMap({ "latitude": lat, "longitude": lng }, mapDiv);
    myMap.loadMap();  

    //create a new marker on the event's location  
    myMap.createMarker({ "latitude": lat, "longitude": lng }, "red");
}
