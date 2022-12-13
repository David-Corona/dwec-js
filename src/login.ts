import "../styles.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import Swal from "sweetalert2";
import { UserLogin } from "./interfaces/user";
import { AuthService } from "./classes/auth-service.class";
import { TokenResponse } from "./interfaces/responses";
import { MyGeolocation } from "./classes/mygeolocation.class";

const authService = new AuthService();
let user: UserLogin = null;
let form: HTMLFormElement = null;
let coords: GeolocationCoordinates = null;


window.addEventListener("load", () => {
    checkToken();
    form = document.getElementById("form-login") as HTMLFormElement;
    geolocate();

    form.addEventListener("submit", event => {
        event.preventDefault();
        tryLogin();
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


//tries to geolocate user, if successfull saves coords in variable
async function geolocate(): Promise<void> {
    try {
        coords = await MyGeolocation.getLocation();
    } catch(e) {
        console.error(e);       
        Swal.fire("Geolocation error", e, "error");
    }
}


async function tryLogin(): Promise<void> {   

    //email and password which will be posted to server to try to log in
    user = {
        email: form.email.value,
        password: form.password.value,
    };

    //coords not obligatory, but if we have them, add to JSON
    if (coords) {
        user.lat = coords.latitude;
        user.lng = coords.longitude;
    }
    
    //if login is successfull, store the token in localstorage and redirect to index
    try {
        const token: TokenResponse = await authService.login(user);
        localStorage.setItem("token", token.accessToken);
        location.assign("index.html");  
    } catch (e) { //error, usually incorrect email/password
        console.error(e);
        Swal.fire("Log in error", "(Error " + e.status + ") " + e.error + ".", "error");
    }
}
