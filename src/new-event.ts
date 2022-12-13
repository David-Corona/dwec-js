import "../styles.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import Swal from "sweetalert2";
import { MyEvent } from "./interfaces/myevent";
import { EventService } from "./classes/event-service.class";
import { AuthService } from "./classes/auth-service.class";
import { MyMap } from "./classes/mymap.class";
import { MyGeolocation } from "./classes/mygeolocation.class";

const eventService = new EventService();
const authService = new AuthService();
let form: HTMLFormElement = null;
let imgPreview: any = null;
let mapDiv: HTMLDivElement = null;
let coords: GeolocationCoordinates = null;


window.addEventListener("load", () => {
    checkToken();
    document.getElementById("logout").addEventListener("click", () => authService.logout());
    form = document.getElementById("newEvent") as HTMLFormElement;
    imgPreview = document.getElementById("imgPreview");
    mapDiv = document.getElementById("map") as HTMLDivElement;
    form.image.addEventListener("change", loadImage);

    loadMap();
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


async function loadMap(): Promise<void> {
    
    //get location to center map
    try {
        coords = await MyGeolocation.getLocation();       
    } catch {
        console.error();
        Swal.fire("Error!", "Could not obtain your location!", "error");
    }
    
    //create a new myMap object, which will show the map in the selected div.
    const myMap = new MyMap(coords, mapDiv);
    myMap.loadMap();

    //create a new marker on our location  
    const marker = myMap.createMarker(coords, "red");

    //add MapboxGeocoder object to be able to search an address.
    const geocoder = myMap.getAutocomplete();
  
    //event listener, when result of geocoder is obtained:
    geocoder.on("result", e => {
        marker.setLngLat(e.result.center); //show marker in new place
        form.address.value = e.result.place_name; //saves the address in the input       
    });

    //on submit, send the latest marker coords to submitForm method
    form.addEventListener("submit", e => {
        e.preventDefault();
        submitForm(marker.getLngLat());
    });
}


async function submitForm(coords: mapboxgl.LngLat): Promise<void> {
    
    //Checks each input and receives a boolean if valid/invalid.
    const validations = [validateTitle(), validateDate(), validateDescription(), validatePrice(), validateImage(), validateAddress()];

    //if all are valid, post the event.
    if (validations.every(val => val === true)) {

        const myEvent: MyEvent = {
            title: (form.title as any).value,
            date: form.date.value,
            description: form.description.value,
            price: form.price.value,
            image: imgPreview.src,
            address: form.address.value,
            lat: coords.lat,
            lng: coords.lng
        };

        try {
            await eventService.post(myEvent);
            location.assign("index.html");
        } catch(e) {
            console.error(e);
            Swal.fire("Error!", "Unable to add the event!", "error");
        }
    }
}


//loads and shows a preview of the selected image
function loadImage(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) reader.readAsDataURL(file);

    reader.addEventListener("load", () => {
        imgPreview.classList.remove("d-none");
        imgPreview.src = reader.result;
    });
}


//Removes is-valid/is-invalid, then adds valid or invalid to the input class according to parameters.
function setValidInput(input: HTMLInputElement, valid: boolean): void {
    input.classList.remove("is-valid", "is-invalid");
    if (valid) {
        input.classList.add("is-valid");
    } else {
        input.classList.add("is-invalid");
    }
}

function validateTitle(): boolean {
    const valid = /[A-Za-z][A-Za-z\s]*/.test((form.title as any as HTMLInputElement).value);
    setValidInput(form.title as any as HTMLInputElement, valid);
    return valid;
}

function validateDate(): boolean {
    const valid = !!form.date.value;
    setValidInput(form.date, valid);
    return valid;
}

function validateDescription(): boolean {
    const valid = /.*\S.*/.test(form.description.value);
    setValidInput(form.description, valid);
    return valid;
}

function validatePrice(): boolean {
    const valid = form.price.value && form.price.value > 0;
    setValidInput(form.price, valid);
    return valid;
}

function validateImage(): boolean {
    const valid = form.image.files.length > 0 && form.image.files[0].type.startsWith("image");
    setValidInput(form.image, valid);
    return valid;
}

function validateAddress(): boolean {
    const valid = /.*\S.*/.test(form.address.value);
    setValidInput(form.address, valid);
    return valid;
}
