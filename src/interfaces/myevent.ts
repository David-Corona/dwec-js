import { User } from "./user";

export interface MyEvent {
    id?: number;
    title: string;
    description: string;
    price: number;
    lat: number;
    lng: number;
    address: string;
    image: string;
    date: string;
    creator?: User;
    distance?: number;
    numAttend?: number;
    attend?: boolean;
    mine?: boolean;
}