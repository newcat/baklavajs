import { NodeInterfaceType } from "@baklavajs/plugin-interface-types";
import "./interfaceTypes.css";

export const stringType = new NodeInterfaceType<string>("string");
export const numberType = new NodeInterfaceType<number>("number");
export const booleanType = new NodeInterfaceType<boolean>("boolean");
