import { SERVER } from "../constants";
import { Http } from "./http.class";
import { MyEvent } from "../interfaces/myevent";
import { EventResponse, EventsResponse, UsersResponse } from "../interfaces/responses";
import { User } from "../interfaces/user";


export class EventService {
    private http: Http;
    
    constructor(){
        this.http = new Http();
    }

    async getEvents(): Promise<MyEvent[]> {
        const resp = await this.http.get<EventsResponse>(SERVER + "/events");
        return resp.events;
    }

    async getEvent(id: number): Promise<MyEvent> {
        const resp = await this.http.get<EventResponse>(SERVER + "/events/" + id);
        return resp.event;
    }

    async post(event: MyEvent): Promise<MyEvent> {
        const resp = await this.http.post<EventResponse>(SERVER + "/events", event);
        return resp.event;
    }

    async delete(id: number): Promise<void> {
        await this.http.delete<void>(SERVER + "/events/" + id);
    }

    //returns attendees to the event with this id
    async getAttendees(id: number): Promise<User[]> {
        const resp = await this.http.get<UsersResponse>(SERVER + "/events/" + id + "/attend");
        return resp.users; 
    }

    async postAttend(id: number): Promise<void> {
        await this.http.post<void>(SERVER + "/events/" + id + "/attend");
    }

    async deleteAttend(id: number): Promise<void> {
        await this.http.delete<void>(SERVER + "/events/" + id + "/attend");
    }
}