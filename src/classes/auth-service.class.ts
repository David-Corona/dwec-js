import { SERVER } from "../constants";
import { Http } from "./http.class";
import { TokenResponse, UserResponse } from "../interfaces/responses";
import { User, UserLogin } from "../interfaces/user";


export class AuthService {
    private http: Http;

    constructor(){
        this.http = new Http();
    }

    async login(userLogin: UserLogin): Promise<TokenResponse> {
        const resp = await this.http.post<TokenResponse>(SERVER + "/auth/login", userLogin);
        return resp;
    }

    async register(userInfo: User): Promise<User> {
        const resp = await this.http.post<UserResponse>(SERVER + "/auth/register", userInfo);
        return resp.user;
    }

    //returns error when the token is invalid
    async checkToken(): Promise<void> {
        await this.http.get<void>(SERVER + "/auth/validate");
    }

    //removes the token and redirects to login
    logout(): void {
        localStorage.removeItem("token");
        location.assign("login.html");
    }
}
