import mapValues from "lodash/mapValues";
import generateId from "./idGenerator";
import { NodeInterface } from "./nodeInterface";
import { INodeIOState, INodeState, IODefinitionStates } from "../types/state";
import { Editor } from "./editor";
import { PreventableBaklavaEvent, BaklavaEvent, SequentialHook } from "@baklavajs/events";
import { NodeOption } from "./nodeOption";
import { INode, IAddInterfaceEventData, IAddOptionEventData, IOptionEventData, INodeUpdateEventData } from "../types";
import { IODefinition, IODefinitionValues, INodeIO } from "../types/nodeIO";

/**
 * Abstract base class for every node
 */
export abstract class Node<I extends IODefinition, O extends IODefinition> implements INode<I, O> {

    /** Type of the node */
    public abstract type: string;
    /** Customizable display name of the node. */
    public abstract title: string;
    /** Unique identifier of the node */
    public id: string = "node_" + generateId();

    public abstract inputs: I;
    public abstract outputs: O;

    public events = {
        loaded: new BaklavaEvent<Node<I, O>>(),
        beforeAddInput: new PreventableBaklavaEvent<INodeIO<unknown>>(),
        addInput: new BaklavaEvent<INodeIO<unknown>>(),
        beforeRemoveInput: new PreventableBaklavaEvent<INodeIO<unknown>>(),
        removeInput: new BaklavaEvent<INodeIO<unknown>>(),
        beforeAddOutput: new PreventableBaklavaEvent<INodeIO<unknown>>(),
        addOutput: new BaklavaEvent<INodeIO<unknown>>(),
        beforeRemoveOutput: new PreventableBaklavaEvent<INodeIO<unknown>>(),
        removeOutput: new BaklavaEvent<INodeIO<unknown>>(),
    };

    public hooks = {
        beforeLoad: new SequentialHook<INodeState<I, O>>(),
        afterSave: new SequentialHook<INodeState<I, O>>()
    };

    private editorInstance?: Editor;

    public load(state: INodeState<I, O>) {
        this.hooks.beforeLoad.execute(state);
        this.id = state.id;
        this.title = state.title;
        Object.entries(state.inputs).forEach(([k, v]) => {
            if (this.inputs[k]) {
                this.inputs[k].load(v);
            }
        });
        Object.entries(state.outputs).forEach(([k, v]) => {
            if (this.outputs[k]) {
                this.outputs[k].load(v);
            }
        });
        this.events.loaded.emit(this);
    }

    public save(): INodeState<I, O> {

        const inputStates = mapValues(this.inputs, (v) => v.save()) as IODefinitionStates<I>;
        const outputStates = mapValues(this.outputs, (v) => v.save()) as IODefinitionStates<O>;

        const state: INodeState<I, O> = {
            type: this.type,
            id: this.id,
            title: this.title,
            inputs: inputStates,
            outputs: outputStates
        };
        return this.hooks.afterSave.execute(state);
    }

    /**
     * The default implementation does nothing.
     * Overwrite this method to do calculation.
     * @return This method can return a promise.
     * Additionally, when using the engine plugin and this node is a rootNode,
     * the data is returned from the engines calculate function or the calculated event.
     */
    public calculate(inputs: IODefinitionValues<I>, globalValues?: any): IODefinitionValues<O>|Promise<IODefinitionValues<O>>|void {
        // Empty
    }

    /**
     * Add an input interface to the node
     * @param name Name of the interface
     * @param option Optional name of a NodeOption which is displayed when the interface is not connected
     * @param defaultValue Optional default value for the interface/option
     * @param additionalProperties Additional properties of the interface that can be used by plugins
     * @returns The created interface or undefined, if the interface was not created
     */
    protected addInputInterface(name: string, option?: string, defaultValue: any = null, additionalProperties?: Record<string, any>) {
        if (this.events.beforeAddInterface.emit({ name, isInput: true, option, defaultValue })) { return; }
        const intf = this.addInterface(true, name, option);
        intf.events.setValue.addListener(this, () => this.events.update.emit({ name, interface: intf }));
        intf.value = defaultValue;
        Object.entries(additionalProperties || {}).forEach(([k, v]) => { intf[k] = v; });
        this.events.addInterface.emit(intf);
        return intf;
    }

    /**
     * Add an output interface to the node
     * @param name Name of the interface
     * @param additionalProperties Additional properties of the interface that can be used by plugins
     * @returns The created interface or undefined, if the interface was not created
     */
    protected addOutputInterface(name: string, additionalProperties?: Record<string, any>) {
        if (this.events.beforeAddInterface.emit({ name, isInput: false })) { return; }
        const intf = this.addInterface(false, name);
        Object.entries(additionalProperties || {}).forEach(([k, v]) => { intf[k] = v; });
        this.events.addInterface.emit(intf);
        return intf;
    }

    /**
     * Remove an existing interface
     * @param name Name of the interface.
     */
    protected removeInterface(name: string) {
        const intf = this.getInterface(name);
        if (intf) {

            if (this.events.beforeRemoveInterface.emit(intf)) { return; }

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
            this.events.removeInterface.emit(intf);

        }
    }

    /**
     * Add a node option to the node
     * @param name Name of the option
     * @param component Name of the option component
     * @param defaultValue Default value for the option
     * @param sidebarComponent Optional name of the component to display in the sidebar
     * @param additionalProperties Additional properties of the option that can be used by plugins
     * @returns The created option or undefined, if the option was not created
     */
    protected addOption(name: string, component: string, defaultValue: any = null,
                        sidebarComponent?: string, additionalProperties?: Record<string, any>) {
        if (this.events.beforeAddOption.emit({ name, component, defaultValue, sidebarComponent })) { return; }
        const opt = new NodeOption(component, defaultValue, sidebarComponent);
        Object.entries(additionalProperties || {}).forEach(([k, v]) => { opt[k] = v; });
        opt.events.setValue.addListener(this, () => { this.events.update.emit({ name, option: opt }); });
        this.options.set(name, opt);
        this.events.addOption.emit({ name, option: opt });
        return opt;
    }

    /**
     * Remove an existing option
     * @param name Name of the option
     */
    protected removeOption(name: string) {
        if (this.options.has(name)) {
            const option = this.options.get(name)!;
            if (this.events.beforeRemoveOption.emit({ name, option })) { return; }
            this.options.delete(name);
            this.events.removeOption.emit({ name, option });
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
        return this.options.get(name)!.value;
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
        this.options.get(name)!.value = value;
    }

    /**
     * This function will automatically be called as soon as the node is added to an editor.
     * @param editor Editor instance
     */
    public registerEditor(editor: Editor) {
        this.editorInstance = editor;
    }

    private addInterface(isInput: boolean, name: string, option?: string) {
        const intf = new NodeInterface(this, isInput);
        intf.option = option;
        this.interfaces.set(name, intf);
        return intf;
    }

}

interface ICreateNodeTypeArguments<I extends IODefinition, O extends IODefinition> {
    inputs: I;
    outputs: O;
    calculate?: INode<I, O>["calculate"];
}

function createNodeType<I extends IODefinition, O extends IODefinition>(
    args: ICreateNodeTypeArguments<I, O>) {

    return class extends Node

    const node: INode<I, O> = {

    }
    return 
}
