import Vue, { VueConstructor } from "vue";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";

import generateId from "../utility/idGenerator";
import { NodeInterface } from "./nodeInterface";
import { INodeState } from "./state";
import { Editor } from "./editor";

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
    public disablePointerEvents = false;

    /** Use this property to save additional state of the node */
    public state = {};

    private editorInstance?: Editor;

    /** All input interfaces of the node */
    public get inputInterfaces(): Record<string, NodeInterface> {
        return pickBy(this.interfaces, (i) => i.isInput);
    }

    /** All output interfaces of the node */
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
     * @returns The created interface
     */
    protected addInputInterface(name: string, type: string, option?: VueConstructor, defaultValue?: any) {
        const intf = this.addInterface(true, name, type, option);
        intf.value = defaultValue;
        return intf;
    }

    /**
     * Add an output interface to the node
     * @param name Name of the interface
     * @param type Type of the interface
     * @returns The created interface
     */
    protected addOutputInterface(name: string, type: string) {
        return this.addInterface(false, name, type);
    }

    /**
     * Remove an existing interface
     * @param name Name of the interface.
     */
    protected removeInterface(name: string) {
        const intf = this.getInterface(name);
        if (intf) {

            if (intf.connectionCount > 0) {
                if (this.editorInstance) {
                    const connections = this.editorInstance.connections.filter(
                        (c) => c.from === intf || c.to === intf
                    );
                    connections.forEach((c) => {
                        this.editorInstance!.removeConnection(c, false);
                    });
                    this.editorInstance.calculateNodeTree();
                } else {
                    throw new Error(
                        "Interface is connected, but no editor instance is specified. Unable to delete interface"
                    );
                }
            }

            Vue.delete(this.interfaces, name);
            delete this.interfaces[name];

        }
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
        Vue.set(this.options, name, {
            data: defaultValue,
            component,
            sidebarComponent
        });
    }

    /**
     * Remove an existing option
     * @param name Name of the option
     */
    protected removeOption(name: string) {
        if (this.options[name]) {
            Vue.delete(this.options, name);
            delete this.options[name];
        }
    }

    /**
     * Get an interface by its name. If the node does not have an interface with
     * `name`, this method will throw an error.
     * @param name Name of the requested interface
     */
    public getInterface(name: string): NodeInterface {
        if (!this.interfaces[name]) {
            throw new Error(`No interface named '${name}'`);
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

    /**
     * This function will automatically be called as soon as the node is added to an editor.
     * @param editor Editor instance
     */
    public registerEditor(editor: Editor) {
        this.editorInstance = editor;
    }

    private addInterface(isInput: boolean, name: string, type: string, option?: VueConstructor) {
        const intf = new NodeInterface(this, isInput, type);
        intf.option = option;
        Vue.set(this.interfaces, name, intf);
        return intf;
    }

}
