import { SERVER } from "../constants";
import { Http } from "./http.class";
import { User } from "../interfaces/user";
import { UserResponse, AvatarResponse } from "../interfaces/responses";


export class UserService {
    private http: Http;
    
    constructor(){
        this.http = new Http();
    }

    async getUser(id?: number): Promise<User> { 
        let resp = null;
        if (id) { //if id is received by parameter
            resp = await this.http.get<UserResponse>(SERVER + "/users/" + id);
        } else { //if no id, then get user logged in (me)
            resp = await this.http.get<UserResponse>(SERVER + "/users/me");
        }
        return resp.user;
    }

    async saveProfile(name: string, email: string): Promise<void> {
        await this.http.put<UserResponse>(SERVER + "/users/me", {name: name, email: email});   
    }

    async savePhoto(avatar: string): Promise<string> {       
        const resp = await this.http.put<AvatarResponse>(SERVER + "/users/me/photo", {avatar: avatar});
        return resp.avatar;
    }

    async savePassword(password: string): Promise<void> {
        await this.http.put<UserResponse>(SERVER + "/users/me/password", {password: password});
    }

}
