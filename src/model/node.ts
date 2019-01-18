import { VueConstructor } from "vue";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";

import generateId from "../utility/idGenerator";
import { NodeInterface } from "./nodeInterface";
import { INodeState } from "./state";

export type OptionViewsObject = Record<string, VueConstructor>;

export interface IInterfaceCreateOptions {
    type?: string;
    name?: string;
    option?: VueConstructor;
}

/**
 * Abstract base class for every node
 * @abstract
 */
export abstract class Node {

    /** @abstract Type of the node */
    public abstract type: string;
    /** @abstract Name of the node. Should be set equal to {@link type} by default */
    public abstract name: string;

    public id: string;
    public interfaces: Record<string, NodeInterface>;
    public optionViews: OptionViewsObject;
    public options: Record<string, any>;

    public position = { x: 0, y: 0 };
    public state = {};

    public get inputInterfaces() {
        return pickBy(this.interfaces, (i) => i.isInput);
    }

    public get outputInterfaces() {
        return pickBy(this.interfaces, (i) => !i.isInput);
    }

    public constructor() {
        this.id = "node_" + generateId();
        this.interfaces = {};
        this.optionViews = this.getOptions();
        this.options = Object.keys(this.optionViews).reduce((p, k) => {
            p[k] = null;
            return p;
        }, {} as Record<string, any>);
    }

    public load(state: INodeState) {
        this.id = state.id;
        this.name = state.name;
        this.position = state.position;
        this.options = state.options;
        this.state = state.state;
        Object.keys(state.interfaces).forEach((k) => {
            if (this.interfaces[k]) {
                this.interfaces[k].load(state.interfaces[k]);
            }
        });
    }

    public save(): INodeState {
        return {
            type: this.type,
            id: this.id,
            name: this.name,
            position: this.position,
            options: this.options,
            state: this.state,
            interfaces: mapValues(this.interfaces, (i) => i.save())
        };
    }

    /**
     * @virtual
     * The default implementation does nothing.
     * Overwrite this method to do calculation.
     * @return This method can return a promise.
     */
    public calculate() {
        // Empty
    }

    /**
     * @abstract
     * This method must be overwritten and provide a record
     * of all options of this node.
     * Example:
     * `{ optionA: TextOption, optionB: InputOption }`
     * Each option is a Vue component
     * @returns {Record<string, VueConstructor>}
     */
    protected abstract getOptions(): OptionViewsObject;

    private addInterface(isInput: boolean, name: string, type: string, option?: VueConstructor) {
        const intf = new NodeInterface(this, isInput, type);
        intf.option = option;
        this.interfaces[name] = intf;
    }

    /**
     * Add an input interface to the node
     * @param {string} name Name of the interface
     * @param {string} type Type of the interface
     * @param {VueConstructor} option
     * An optional NodeOption which is displayed when the interface is not connected to set its value
     */
    protected addInputInterface(name: string, type: string, option?: VueConstructor) {
        return this.addInterface(true, name, type, option);
    }

    /**
     * Add an output interface to the node
     * @param {string} name Name of the interface
     * @param {string} type Type of the interface
     */
    protected addOutputInterface(name: string, type: string) {
        return this.addInterface(false, name, type);
    }

    /**
     * Get an interface by its name. If the node does not have an interface with
     * `name`, this method will throw an error.
     * @param {string} name Name of the requested interface
     */
    public getInterface(name: string): NodeInterface {
        if (!this.interfaces[name]) {
            throw new Error(`No interface named '{name}'`);
        }
        return this.interfaces[name];
    }

    /**
     * Get the value of option `name`
     * @param {string} name Name of the option
     */
    public getOptionValue(name: string) {
        return this.options[name];
    }

    /**
     * Set the value of option `name`
     * @param {string} name Name of the option
     * @param {any} value New value
     */
    public setOptionValue(name: string, value: any) {
        this.options[name] = value;
    }

}
