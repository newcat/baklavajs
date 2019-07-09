import { IPlugin } from "../../baklavajs-core/types";

export interface IConversion {
    targetType: string;
    transformationFunction(value: any): any;
}

export interface INodeInterfaceType {
    color: string;
    conversions: IConversion[];
}

export interface IInterfaceTypePlugin extends IPlugin {
    addType(name: string, color: string): this;
    addConversion(from: string, to: string, transformationFunction?: (value: any) => any): this;
    getConversion(from: string, to: string): IConversion|undefined;
    canConvert(from: string, to: string): boolean;
    convert(from: string, to: string, value: any): any;
}
