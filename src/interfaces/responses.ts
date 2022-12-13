import { MyEvent } from "./myevent";
import { User } from "./user";

export interface EventsResponse {
    events: MyEvent[];
}

export interface EventResponse {
    event: MyEvent;
}

export interface TokenResponse {
    accessToken: string;
}

export interface UserResponse {
    user: User;
}

export interface AvatarResponse {
    avatar: string;
}

export interface UsersResponse {
    users: User[];
}
