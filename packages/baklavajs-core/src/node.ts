import mapValues from "lodash/mapValues";
import generateId from "./idGenerator";
import { NodeInterface } from "./nodeInterface";
import { INodeState, IODefinitionStates } from "../types/state";
import { Editor } from "./editor";
import { PreventableBaklavaEvent, BaklavaEvent, SequentialHook } from "@baklavajs/events";
import { INode } from "../types";
import { IODefinition, IODefinitionValues, INodeIO } from "../types/nodeIO";

/**
 * Abstract base class for every node
 */
export abstract class Node<I extends IODefinition<I>, O extends IODefinition<O>> implements INode<I, O> {
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
        afterSave: new SequentialHook<INodeState<I, O>>(),
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
            outputs: outputStates,
        };
        return this.hooks.afterSave.execute(state);
    }

    /**
     * The default implementation does nothing.
     * Overwrite this method to do calculation.
     * @param inputs Values of all input interfaces / input options
     * @param globalValues Set of values passed to every node by the engine plugin
     * @return Values for output interfaces / output plugins
     */
    public calculate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        inputs: IODefinitionValues<I>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        globalValues?: Record<string, any>
    ): IODefinitionValues<O> | Promise<IODefinitionValues<O>> | void {
        // Empty
    }

    /**
     * Add an input interface or option to the node
     * @param key Key of the input
     * @param input The input instance
     * @returns True when the input was added, otherwise false (prevented by an event handler)
     */
    protected addInput(key: string, input: INodeIO<unknown>): boolean {
        return this.addIO("input", key, input);
    }

    /**
     * Add an output interface or option to the node
     * @param key Key of the output
     * @param output The output instance
     * @returns True when the output was added, otherwise false (prevented by an event handler)
     */
    protected addOutput(key: string, output: INodeIO<unknown>): boolean {
        return this.addIO("output", key, output);
    }

    /**
     * Remove an existing input
     * @param key Key of the input.
     */
    protected removeInput(key: string): boolean {
        return this.removeIO("input", key);
    }

    /**
     * Remove an existing output
     * @param key Key of the output.
     */
    protected removeOutput(key: string): boolean {
        return this.removeIO("output", key);
    }

    /**
     * This function will automatically be called as soon as the node is added to an editor.
     * @param editor Editor instance
     */
    public registerEditor(editor: Editor): void {
        this.editorInstance = editor;
    }

    private addIO(type: "input" | "output", key: string, io: INodeIO<unknown>): boolean {
        const beforeEvent = type === "input" ? this.events.beforeAddInput : this.events.beforeAddOutput;
        const afterEvent = type === "input" ? this.events.addInput : this.events.addOutput;
        const ioObject = type === "input" ? this.inputs : this.outputs;
        if (beforeEvent.emit(io)) {
            return false;
        }
        (ioObject as Record<string, INodeIO<unknown>>)[key] = io;
        afterEvent.emit(io);
        return true;
    }

    private removeIO(type: "input" | "output", key: string): boolean {
        const beforeEvent = type === "input" ? this.events.beforeRemoveInput : this.events.beforeRemoveOutput;
        const afterEvent = type === "input" ? this.events.removeInput : this.events.removeOutput;
        const io = type === "input" ? this.inputs[key] : this.outputs[key];
        if (!io || beforeEvent.emit(io)) {
            return false;
        }

        if (io.type === "interface" && (io as NodeInterface<unknown>).connectionCount > 0) {
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

export type AbstractNode = Node<IODefinition, IODefinition>;
