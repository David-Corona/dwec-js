import "../styles.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import Swal from "sweetalert2";
import { User } from "./interfaces/user";
import { AuthService } from "./classes/auth-service.class";
import { MyGeolocation } from "./classes/mygeolocation.class";

const authService = new AuthService();
let user: User = null;
let form: HTMLFormElement = null;
let imgPreview: any = null;


window.addEventListener("load", () => {
    checkToken();
    form = document.getElementById("form-register") as HTMLFormElement;
    imgPreview = document.getElementById("imgPreview");
    form.avatar.addEventListener("change", loadImage);

    geolocate();

    form.addEventListener("submit", event => {
        event.preventDefault();
        createAccount();
    });
});


//checks token to see if user is logged in
async function checkToken(): Promise<void> {
    if (localStorage.getItem("token")){ //if there's a token stored in localStorage
        try { //check valid token
            await authService.checkToken();
            location.assign("index.html"); //valid token => already logged in => redirect to index
        } catch(e) { //token is invalid, throws error
            console.error(e);
            localStorage.removeItem("token"); //invalid token, delete it.
            //Swal.fire("Error", e.message, "error");
        }
    } else { //no token
        console.log("No token found");
    }
}


// gets location and shows in inputs. If error => return false.
async function geolocate(): Promise<boolean> { 
    
    try {
        const coords = await MyGeolocation.getLocation();
        
        //Show coords in the inputs
        form.lat.value = coords.latitude;
        form.lng.value = coords.longitude;
        return true;
    } catch(e) {
        //show default coords if error in geolocation      
        form.lat.value = 0;
        form.lng.value = 0;
        Swal.fire("Geolocation error", "Could not obtain coordinates.<br/>" + e + "<br/>Allow geolocation to create account", "error");
        return false;
    }
}


//validates the inputs and registers the user if all correct. Receives coords by parameter.
async function createAccount(): Promise<void> {

    //Checks each input and receives a boolean if valid/invalid.
    const validations = [validateName(), validatePassword(), validateEmail1(), validateEmail2(), validateCoords(), validateAvatar()];

    //if all are valid, post the event.
    if (validations.every(val => val === true)) {

        user = {
            name: form.nameUser.value,
            email: form.email.value,
            password: form.password.value,
            avatar: imgPreview.src,
            lat: +form.lat.value,
            lng: +form.lng.value
        };
        
        try {
            await authService.register(user);
            location.assign("login.html"); //redirect to login
        } catch(e) {
            console.error(e);
            Swal.fire("Unable to create account", e.error + ":<br/>" + e.message.join("<br/>"), "error");
        }
    } else {
        Swal.fire("Unable to create account", "Check that all inputs are filled in and valid.", "error");
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

function validateName(): boolean {
    const valid = /[A-Za-z][A-Za-z\s]*/.test((form.name as any as HTMLInputElement).value);
    setValidInput(form.name as any as HTMLInputElement, valid);
    return valid;
}

function validateEmail1(): boolean {
    const valid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(form.email.value);
    setValidInput(form.email, valid);
    return valid;
}

//checks it's a valid email and that it coincides with previuos email input
function validateEmail2(): boolean {
    const valid = form.email.value == form.email2.value 
        && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(form.email2.value);    
    setValidInput(form.email2, valid);
    return valid;
}

function validatePassword(): boolean {
    const valid = /.*\S.*/.test(form.password.value);
    setValidInput(form.password, valid);
    return valid;
}

function validateCoords(): boolean {
    const valid = form.lat.value != 0 && form.lng.value != 0;
    setValidInput(form.lat, valid);
    setValidInput(form.lng, valid);
    return valid;
}

function validateAvatar(): boolean {
    const valid = form.avatar.files.length > 0 && form.avatar.files[0].type.startsWith("image");
    setValidInput(form.avatar, valid);
    return valid;
}