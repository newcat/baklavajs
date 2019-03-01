import { VueConstructor } from "vue";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";

import generateId from "../utility/idGenerator";
import { NodeInterface } from "./nodeInterface";
import { INodeState } from "./state";

export interface IOption {
    component: VueConstructor;
    data: any;
    sidebarComponent?: VueConstructor;
}

export interface IInterfaceCreateOptions {
    type?: string;
    name?: string;
    option?: VueConstructor;
}

/**
 * Abstract base class for every node
 */
export abstract class Node {

    /** Type of the node */
    public abstract type: string;
    /** Name of the node. Should be set equal to {@link type} by default */
    public abstract name: string;

    public id: string = "node_" + generateId();
    public interfaces: Record<string, NodeInterface> = {};
    public options: Record<string, IOption> = {};

    public position = { x: 0, y: 0 };
    public state = {};
    public disablePointerEvents = false;

    /**
     * All input interfaces of the node
     */
    public get inputInterfaces(): Record<string, NodeInterface> {
        return pickBy(this.interfaces, (i) => i.isInput);
    }

    /**
     * All output interfaces of the node
     */
    public get outputInterfaces(): Record<string, NodeInterface> {
        return pickBy(this.interfaces, (i) => !i.isInput);
    }

    public load(state: INodeState) {
        this.id = state.id;
        this.name = state.name;
        this.position = state.position;
        this.state = state.state;
        Object.keys(state.options).forEach((k) => {
            if (this.options[k]) {
                this.options[k].data = state.options[k];
            }
        });
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
            options: mapValues(this.options, (o) => o.data),
            state: this.state,
            interfaces: mapValues(this.interfaces, (i) => i.save())
        };
    }

    /**
     * The default implementation does nothing.
     * Overwrite this method to do calculation.
     * @return This method can return a promise.
     */
    public calculate(): any {
        // Empty
    }

    /**
     * Add an input interface to the node
     * @param name Name of the interface
     * @param type Type of the interface
     * @param option
     * Optional NodeOption which is displayed when the interface is not connected to set its value
     * @param defaultValue Optional default value for the interface/option
     */
    protected addInputInterface(name: string, type: string, option?: VueConstructor, defaultValue?: any) {
        return this.addInterface(true, name, type, option);
    }

    /**
     * Add an output interface to the node
     * @param name Name of the interface
     * @param type Type of the interface
     */
    protected addOutputInterface(name: string, type: string) {
        return this.addInterface(false, name, type);
    }

    /**
     * Add a node option to the node
     * @param name Name of the option
     * @param component Option component
     * @param defaultValue Default value for the option
     * @param sidebarComponent Optional component to display in the sidebar
     */
    protected addOption(name: string, component: VueConstructor,
                        defaultValue: any = null, sidebarComponent?: VueConstructor) {
        this.options[name] = {
            data: defaultValue,
            component,
            sidebarComponent
        };
    }

    /**
     * Get an interface by its name. If the node does not have an interface with
     * `name`, this method will throw an error.
     * @param name Name of the requested interface
     */
    public getInterface(name: string): NodeInterface {
        if (!this.interfaces[name]) {
            throw new Error(`No interface named '{name}'`);
        }
        return this.interfaces[name];
    }

    /**
     * Get the value of option `name`
     * @param name Name of the option
     */
    public getOptionValue(name: string) {
        return this.options[name].data;
    }

    /**
     * Set the value of option `name`
     * @param name Name of the option
     * @param value New value
     */
    public setOptionValue(name: string, value: any) {
        this.options[name].data = value;
    }

    private addInterface(isInput: boolean, name: string, type: string, option?: VueConstructor) {
        const intf = new NodeInterface(this, isInput, type);
        intf.option = option;
        this.interfaces[name] = intf;
    }

}
