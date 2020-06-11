import { INodeIO } from "./nodeIO";

export interface INodeOption<T> extends INodeIO<T> {
    component: string;
}
