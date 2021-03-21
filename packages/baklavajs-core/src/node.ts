import mapValues from "lodash.mapvalues";
import { PreventableBaklavaEvent, BaklavaEvent, SequentialHook } from "@baklavajs/events";
import { v4 as uuidv4 } from "uuid";
import type { Editor } from "./editor";
import type {
    NodeInterfaceDefinition,
    NodeInterfaceDefinitionValues,
    NodeInterface,
    NodeInterfaceDefinitionStates,
} from "./nodeInterface";

export type CalculateFunctionReturnType<O extends NodeInterfaceDefinition> =
    | NodeInterfaceDefinitionValues<O>
    | Promise<NodeInterfaceDefinitionValues<O>>
    | void;

export type CalculateFunction<I extends NodeInterfaceDefinition, O extends NodeInterfaceDefinition> = (
    inputs: NodeInterfaceDefinitionValues<I>,
    globalValues?: any
    // ) => CalculateFunctionReturnType<O>;
) => CalculateFunctionReturnType<O>;

export interface INodeState<I, O> {
    type: string;
    title: string;
    id: string;
    inputs: NodeInterfaceDefinitionStates<I>;
    outputs: NodeInterfaceDefinitionStates<O>;
}

/**
 * Abstract base class for every node
 */
export abstract class Node<
    I extends NodeInterfaceDefinition = NodeInterfaceDefinition,
    O extends NodeInterfaceDefinition = NodeInterfaceDefinition
> {
    /** Type of the node */
    public abstract type: string;
    /** Customizable display name of the node. */
    public abstract title: string;
    /** Unique identifier of the node */
    public id: string = uuidv4();

    public abstract inputs: I;
    public abstract outputs: O;

    public events = {
        loaded: new BaklavaEvent<AbstractNode>(),
        beforeAddInput: new PreventableBaklavaEvent<NodeInterface>(),
        addInput: new BaklavaEvent<NodeInterface>(),
        beforeRemoveInput: new PreventableBaklavaEvent<NodeInterface>(),
        removeInput: new BaklavaEvent<NodeInterface>(),
        beforeAddOutput: new PreventableBaklavaEvent<NodeInterface>(),
        addOutput: new BaklavaEvent<NodeInterface>(),
        beforeRemoveOutput: new PreventableBaklavaEvent<NodeInterface>(),
        removeOutput: new BaklavaEvent<NodeInterface>(),
    };

    public hooks = {
        beforeLoad: new SequentialHook<INodeState<NodeInterfaceDefinition, NodeInterfaceDefinition>>(),
        afterSave: new SequentialHook<INodeState<NodeInterfaceDefinition, NodeInterfaceDefinition>>(),
    };

    private editorInstance?: Editor;

    public load(state: INodeState<I, O>): void {
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
        this.events.loaded.emit(this as any);
    }

    public save(): INodeState<I, O> {
        const inputStates = mapValues(this.inputs, (v) => v.save()) as NodeInterfaceDefinitionStates<I>;
        const outputStates = mapValues(this.outputs, (v) => v.save()) as NodeInterfaceDefinitionStates<O>;

        const state: INodeState<I, O> = {
            type: this.type,
            id: this.id,
            title: this.title,
            inputs: inputStates,
            outputs: outputStates,
        };
        return this.hooks.afterSave.execute(state) as INodeState<I, O>;
    }

    /**
     * The default implementation does nothing.
     * Overwrite this method to do calculation.
     * @param inputs Values of all input interfaces
     * @param globalValues Set of values passed to every node by the engine plugin
     * @return Values for output interfaces
     */
    public calculate?: CalculateFunction<I, O>;

    /**
     * Add an input interface to the node
     * @param key Key of the input
     * @param input The input instance
     * @returns True when the input was added, otherwise false (prevented by an event handler)
     */
    protected addInput(key: string, input: NodeInterface): boolean {
        return this.addInterface("input", key, input);
    }

    /**
     * Add an output interface to the node
     * @param key Key of the output
     * @param output The output instance
     * @returns True when the output was added, otherwise false (prevented by an event handler)
     */
    protected addOutput(key: string, output: NodeInterface): boolean {
        return this.addInterface("output", key, output);
    }

    /**
     * Remove an existing input
     * @param key Key of the input.
     */
    protected removeInput(key: string): boolean {
        return this.removeInterface("input", key);
    }

    /**
     * Remove an existing output
     * @param key Key of the output.
     */
    protected removeOutput(key: string): boolean {
        return this.removeInterface("output", key);
    }

    /**
     * This function will automatically be called as soon as the node is added to an editor.
     * @param editor Editor instance
     */
    public registerEditor(editor: Editor): void {
        this.editorInstance = editor;
    }

    private addInterface(type: "input" | "output", key: string, io: NodeInterface): boolean {
        const beforeEvent = type === "input" ? this.events.beforeAddInput : this.events.beforeAddOutput;
        const afterEvent = type === "input" ? this.events.addInput : this.events.addOutput;
        const ioObject = type === "input" ? this.inputs : this.outputs;
        if (beforeEvent.emit(io)) {
            return false;
        }
        (ioObject as Record<string, NodeInterface>)[key] = io;
        io.parent = this as AbstractNode;
        io.isInput = type === "input";
        afterEvent.emit(io);
        return true;
    }

    private removeInterface(type: "input" | "output", key: string): boolean {
        const beforeEvent = type === "input" ? this.events.beforeRemoveInput : this.events.beforeRemoveOutput;
        const afterEvent = type === "input" ? this.events.removeInput : this.events.removeOutput;
        const io = type === "input" ? this.inputs[key] : this.outputs[key];
        if (!io || beforeEvent.emit(io)) {
            return false;
        }

        if (io.connectionCount > 0) {
            if (this.editorInstance) {
                const connections = this.editorInstance.connections.filter((c) => c.from === io || c.to === io);
                connections.forEach((c) => {
                    this.editorInstance!.removeConnection(c);
                });
            } else {
                throw new Error(
                    "Interface is connected, but no editor instance is specified. Unable to delete interface"
                );
            }
        }

        if (type === "input") {
            delete this.inputs[key];
        } else {
            delete this.outputs[key];
        }
        afterEvent.emit(io);
        return true;
    }
}

export type AbstractNode = Node<NodeInterfaceDefinition, NodeInterfaceDefinition>;
export type AbstractNodeConstructor = new () => AbstractNode;
