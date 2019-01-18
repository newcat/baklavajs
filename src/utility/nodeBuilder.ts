import { VueConstructor } from "vue";
import { Node, OptionViewsObject, NodeConstructor } from "../model";

interface IInterfaceOptions {
    isInput: boolean;
    name: string;
    type: string;
    option?: VueConstructor;
    defaultValue?: any;
}

type CalculationFunction = (this: Node, n: Node) => any;

function generateNode(
    type: string, intfs: IInterfaceOptions[],
    options: OptionViewsObject, optionValues: Record<string, any>,
    calcFunction?: CalculationFunction
) {
    return class extends Node {

        type = type;
        name = type;

        constructor() {
            super();
            for (const i of intfs) {
                if (i.isInput) {
                    this.addInputInterface(i.name, i.type, i.option);
                } else {
                    this.addOutputInterface(i.name, i.type);
                }
            }
            this.options = optionValues;
        }

        protected getOptions(): OptionViewsObject {
            return options;
        }

        public calculate() {
            if (calcFunction) {
                return calcFunction.call(this, this);
            }
        }

    };
}

export class NodeBuilder {

    name = "";
    intfs: IInterfaceOptions[] = [];
    options: OptionViewsObject = {};
    optionValues: Record<string, any> = {};
    calcFunction?: CalculationFunction;

    constructor(name: string) {
        this.name = name;
    }

    public build() {
        return generateNode(
            this.name, this.intfs, this.options, this.optionValues, this.calcFunction) as NodeConstructor;
    }

    public addInputInterface(name: string, type: string, option?: VueConstructor, defaultValue?: any) {
        this.intfs.push({ isInput: true, name, type, option, defaultValue });
        return this;
    }

    public addOutputInterface(name: string, type: string) {
        this.intfs.push({ isInput: false, name, type });
        return this;
    }

    public addOption(name: string, option: VueConstructor, defaultValue?: any) {
        this.options[name] = option;
        this.optionValues[name] = defaultValue;
        return this;
    }

    public onCalculate(cb: CalculationFunction) {
        this.calcFunction = cb;
        return this;
    }

}
