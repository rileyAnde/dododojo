import { backend_Card } from "./accounts";
/**
Functions: 
main:creates models that are used throughout the this part of the backend 
helper:none
Inputs: N/A
Outputs: N/A
Authors: Hannah Smith 
**/

//model interfaces for gyms -- this has less information then the frontend does
export interface gym {
    name: string;
    owner_username: string;
    deck: backend_Card[]
}