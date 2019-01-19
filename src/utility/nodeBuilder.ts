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

        public calculate(): any {
            if (calcFunction) {
                return calcFunction.call(this, this);
            }
        }

    };
}

/** Utility class for creating custom nodes */
export class NodeBuilder {

    private name = "";
    private intfs: IInterfaceOptions[] = [];
    private options: OptionViewsObject = {};
    private optionValues: Record<string, any> = {};
    private calcFunction?: CalculationFunction;

    public constructor(name: string) {
        this.name = name;
    }

    /**
     * Build the node class.
     * This must be called as the last operation when building a node.
     * @returns {NodeConstructor} The generated node class
     */
    public build() {
        return generateNode(
            this.name, this.intfs, this.options, this.optionValues, this.calcFunction) as NodeConstructor;
    }

    /**
     * Add an input interface to the node
     * @param {string} name Name of the interface
     * @param {string} type Type of the interface
     * @param {VueConstructor} [option] A node option component to be displayed when the interface is not connected
     * @param {any} [defaultValue] Default value for the node option
     * @returns {NodeBuilder} Current node builder instance for chaining
     */
    public addInputInterface(name: string, type: string, option?: VueConstructor, defaultValue?: any) {
        this.intfs.push({ isInput: true, name, type, option, defaultValue });
        return this;
    }

    /**
     * Add an output interface to the node
     * @param {string} name Name of the interface
     * @param {string} type Type of the interface
     * @returns {NodeBuilder} Current node builder instance for chaining
     */
    public addOutputInterface(name: string, type: string) {
        this.intfs.push({ isInput: false, name, type });
        return this;
    }

    /**
     * Add a node option to the node
     * @param {string} name Name of the option
     * @param {VueConstructor} option Option component
     * @param {any} [defaultValue=null] Default value for the option
     * @returns {NodeBuilder} Current node builder instance for chaining
     */
    public addOption(name: string, option: VueConstructor, defaultValue: any = null) {
        this.options[name] = option;
        this.optionValues[name] = defaultValue;
        return this;
    }

    /**
     * Register a callback for the calculation function.
     * The callback will receive the node instance as first parameter.
     * (If you do not use ES6 arrow functions, the node instance
     * will also be bound to `this`)
     * @param cb Callback to be executed when `calculate()` is called on the node
     * @returns {NodeBuilder} Current node builder instance for chaining
     */
    public onCalculate(cb: CalculationFunction) {
        this.calcFunction = cb;
        return this;
    }

}
