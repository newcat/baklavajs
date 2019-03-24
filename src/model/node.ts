import generateId from "./idGenerator";
import { NodeInterface } from "./nodeInterface";
import { INodeState } from "./state";
import { Editor } from "./editor";
import { BaklavaEventEmitter, IAddInterfaceEventData, IInterfaceEventData, IAddOptionEventData, IOptionEventData } from "../events";

function pickBy(obj: Record<string, any>, predicate: (x: any) => boolean): Record<string, any> {
    return Object.entries(obj)
        .filter(([k, v]) => predicate(v))
        .reduce((p, [k, v]) => {
            p[k] = v;
            return p;
        }, {} as Record<string, any>);
}

export interface IOption {
    optionComponent: string;
    data: any;
    sidebarComponent?: string;
}

export interface IInterfaceCreateOptions {
    type?: string;
    name?: string;
    optionName?: string;
}

/**
 * Abstract base class for every node
 */
export abstract class Node extends BaklavaEventEmitter {

    /** Type of the node */
    public abstract type: string;
    /** Name of the node. Should be set equal to {@link type} by default */
    public abstract name: string;

    public id: string = "node_" + generateId();
    public interfaces: Map<string, NodeInterface> = new Map();
    public options: Map<string, IOption> = new Map();
    public position = { x: 0, y: 0 };
    public disablePointerEvents = false;

    /** Use this property to save additional state of the node */
    public state: Record<string, any> = {};

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
            if (this.options.has(k)) {
                this.options.get(k)!.data = state.options[k];
            }
        });
        Object.keys(state.interfaces).forEach((k) => {
            if (this.interfaces.has(k)) {
                this.interfaces.get(k)!.load(state.interfaces[k]);
            }
        });
    }

    public save(): INodeState {
        return {
            type: this.type,
            id: this.id,
            name: this.name,
            position: this.position,
            options: Array.from(this.options.entries()).map(([k, o]) => [k, o.data]) as any,
            state: this.state,
            interfaces: Array.from(this.interfaces.entries()).map(([k, i]) => [k, i.save()]) as any
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
    protected addInputInterface(name: string, type: string, option?: string, defaultValue?: any) {
        if (this.emitPreventable<IAddInterfaceEventData>("beforeAddInterface", {
            name, type, isInput: true, option, defaultValue
        })) {
            return;
        }
        const intf = this.addInterface(true, name, type, option);
        intf.value = defaultValue;
        this.emit<IInterfaceEventData>("addInterface", { interface: intf });
        return intf;
    }

    /**
     * Add an output interface to the node
     * @param name Name of the interface
     * @param type Type of the interface
     * @returns The created interface
     */
    protected addOutputInterface(name: string, type: string) {
        if (this.emitPreventable<IAddInterfaceEventData>("beforeAddInterface", { name, type, isInput: false, })) {
            return;
        }
        const intf = this.addInterface(false, name, type);
        this.emit<IInterfaceEventData>("addInterface", { interface: intf });
        return intf;
    }

    /**
     * Remove an existing interface
     * @param name Name of the interface.
     */
    protected removeInterface(name: string) {
        const intf = this.getInterface(name);
        if (intf) {

            if (this.emitPreventable<IInterfaceEventData>("beforeRemoveInterface", { interface: intf })) { return; }

            if (intf.connectionCount > 0) {
                if (this.editorInstance) {
                    const connections = this.editorInstance.connections.filter(
                        (c) => c.from === intf || c.to === intf
                    );
                    connections.forEach((c) => {
                        this.editorInstance!.removeConnection(c);
                    });
                } else {
                    throw new Error(
                        "Interface is connected, but no editor instance is specified. Unable to delete interface"
                    );
                }
            }

            this.interfaces.delete(name);
            this.emit<IInterfaceEventData>("removeInterface", { interface: intf });

        }
    }

    /**
     * Add a node option to the node
     * @param name Name of the option
     * @param component Option component
     * @param defaultValue Default value for the option
     * @param sidebarComponent Optional component to display in the sidebar
     */
    protected addOption(name: string, component: string, defaultValue: any = null, sidebarComponent?: string) {
        if (this.emitPreventable<IAddOptionEventData>("beforeAddOption", {
            name, component, defaultValue, sidebarComponent
        })) {
            return;
        }
        const opt = {
            data: defaultValue,
            optionComponent: component,
            sidebarComponent
        };
        this.options.set(name, opt);
        this.emit<IOptionEventData>("addOption", { option: opt });
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
        if (!this.interfaces.has(name)) {
            throw new Error(`No interface named '${name}'`);
        }
        return this.interfaces.get(name)!;
    }

    /**
     * Get the value of option `name`
     * @param name Name of the option
     */
    public getOptionValue(name: string) {
        if (!this.options.has(name)) {
            throw new Error(`No option named '${name}'`);
        }
        return this.options.get(name)!.data;
    }

    /**
     * Set the value of option `name`
     * @param name Name of the option
     * @param value New value
     */
    public setOptionValue(name: string, value: any) {
        if (!this.options.has(name)) {
            throw new Error(`No option named '${name}'`);
        }
        this.options.get(name)!.data = value;
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
