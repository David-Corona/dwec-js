import "../styles.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import Swal from "sweetalert2";
import { User } from "./interfaces/user";
import { UserService } from "./classes/user-service.class";
import { AuthService } from "./classes/auth-service.class";

let profileForm: HTMLFormElement = null;
let photoForm: HTMLFormElement = null;
let passwordForm: HTMLFormElement = null;
let user: User = null;
const userService = new UserService();
const authService = new AuthService();


window.addEventListener("load", () => {
    checkToken();
    document.getElementById("logout").addEventListener("click", () => authService.logout());

    profileForm = document.getElementById("form-profile") as HTMLFormElement;
    profileForm.addEventListener("submit", event => {
        event.preventDefault();
        editProfile();
    });

    photoForm = document.getElementById("form-photo") as HTMLFormElement;
    photoForm.addEventListener("submit", event => {
        event.preventDefault();
        editPhoto();
    });
    photoForm.image.addEventListener("change", loadImage);

    passwordForm = document.getElementById("form-password") as HTMLFormElement;
    passwordForm.addEventListener("submit", event => {
        event.preventDefault();
        editPassword();
    });
    
    getUser();
});


//checks token to see if user is logged in
async function checkToken(): Promise<void> {
    if (localStorage.getItem("token")){ //if there's a token stored in localStorage
        try { //check valid token
            await authService.checkToken(); //no error => valid token => logged in
        } catch(e) { //token is invalid, throws error
            console.error(e);
            location.assign("login.html"); //invalid token => login
        }
    } else { //no token
        location.assign("login.html"); //if no token => login
    }
}


async function getUser(): Promise<void> {
    try { //obtains user currently logged in
        user = await userService.getUser();
        loadForms(user);
    } catch(e) {
        console.error(e);
        Swal.fire("(Error " + e.statusCode + ") " + e.message + ".", "User not found!", "error")
            .then(() => {
                location.assign("index.html"); //redirect after showing message
            });
    }
}


//shows logged user's info, except password
function loadForms(user: User): void {

    //show user's name and email in the inputs
    (profileForm.name as any as HTMLInputElement).value = user.name;
    profileForm.email.value = user.email;

    //shows preview of current avatar
    photoForm.photo.src = user.avatar;    
}


async function editProfile(): Promise<void> {
    if (validateName() && validateEmail()) { //if name and email are valid
        try {
            await userService.saveProfile((profileForm.name as any as HTMLInputElement).value, profileForm.email.value);
            Swal.fire("Saved!", "Your profile has been updated successfully!", "success");
        } catch(e) {
            console.error(e);
            Swal.fire("Error!", "Unable to edit profile!", "error");
        }
    } else {
        Swal.fire("Error!", "Invalid email or name.", "error");
    }
}


async function editPhoto(): Promise<void> {
    if (validateImage()) { //if an image has been uploaded
        try {
            const resp = await userService.savePhoto(photoForm.imgPreview.src);       
            console.log("Returns image url: " + resp); //check return
            Swal.fire("Saved!", "Your photo has been updated successfully!", "success")
                .then(() => {
                    location.reload(); //reload to update preview
                });
        } catch(e) {
            console.error(e);
            Swal.fire("Error!", "Unable to edit the photo!", "error");
        }
    } else {
        Swal.fire("Error!", "Invalid input.", "error");
    }
}


async function editPassword(): Promise<void> {
    if (validatePassword() && validatePassword2()){ //checks valid password and both inputs coincide
        try {
            await userService.savePassword(passwordForm.password.value);       
            Swal.fire("Saved!", "Your password has been updated successfully!", "success")
                .then(() => {
                    location.reload(); //reload to update preview
                });
        } catch(e) {
            console.error(e);
            Swal.fire("Error!", "Unable to edit the password!", "error");
        }
    } else {
        Swal.fire("Error!", "Passwords don't coincide or are invalid.", "error");
    }
}


//loads and shows a preview of the selected image next to current avatar
function loadImage(event: any): void {
    const file = event.target.files[0];   
    const reader = new FileReader();

    if (file) reader.readAsDataURL(file);

    reader.addEventListener("load", () => {
        photoForm.imgPreview.classList.remove("d-none");
        photoForm.imgPreview.src = reader.result;
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
    const valid = /[A-Za-z][A-Za-z\s]*/.test((profileForm.name as any as HTMLInputElement).value);
    setValidInput(profileForm.name as any as HTMLInputElement, valid);
    return valid;
}

function validateEmail(): boolean {
    const valid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(profileForm.email.value);
    setValidInput(profileForm.email, valid);
    return valid;
}

function validateImage(): boolean {
    const valid = photoForm.image.files.length > 0 && photoForm.image.files[0].type.startsWith("image");
    setValidInput(photoForm.image, valid);
    return valid;
}

function validatePassword(): boolean {
    const valid = /.*\S.*/.test(passwordForm.password.value);
    setValidInput(passwordForm.password, valid);
    return valid;
}

//checks it's a valid password and that it coincides with previuos password input
function validatePassword2(): boolean {
    const valid = passwordForm.password.value == passwordForm.password2.value 
        && /.*\S.*/.test(passwordForm.password2.value);
    setValidInput(passwordForm.password2, valid);
    return valid;
}