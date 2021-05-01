import {
    PreventableBaklavaEvent,
    BaklavaEvent,
    SequentialHook,
    IBaklavaEventEmitter,
    IBaklavaTapable,
} from "@baklavajs/events";
import type { AbstractNodeConstructor } from "./node";
import type { IAddNodeTypeEventData, IRegisterNodeTypeOptions } from "./eventDataTypes";
import { Graph, IGraphState } from "./graph";

export interface IPlugin {
    type: string;
    register(editor: Editor): void;
}

export interface IEditorState extends Record<string, any> {
    graph: IGraphState;
}

export interface INodeTypeInformation extends Required<IRegisterNodeTypeOptions> {
    type: AbstractNodeConstructor;
}

/** The main model class for BaklavaJS */
export class Editor implements IBaklavaEventEmitter, IBaklavaTapable {
    private _plugins: Set<IPlugin> = new Set();
    private _nodeTypes: Map<string, INodeTypeInformation> = new Map();
    private _graph = new Graph(this);

    public graphTemplates: IGraphState[] = [];

    public events = {
        loaded: new BaklavaEvent<void>(),
        beforeRegisterNodeType: new PreventableBaklavaEvent<IAddNodeTypeEventData>(),
        registerNodeType: new BaklavaEvent<IAddNodeTypeEventData>(),
        beforeUsePlugin: new PreventableBaklavaEvent<IPlugin>(),
        usePlugin: new BaklavaEvent<IPlugin>(),
    };

    public hooks = {
        save: new SequentialHook<IEditorState>(),
        load: new SequentialHook<IEditorState>(),
    };

    /** List of all registered node types */
    public get nodeTypes(): ReadonlyMap<string, INodeTypeInformation> {
        return this._nodeTypes;
    }

    /** List of all plugins in this editor */
    public get plugins(): ReadonlySet<IPlugin> {
        return this._plugins;
    }

    public get graph(): Graph {
        return this._graph;
    }

    /**
     * Register a new node type
     * @param type Actual type / constructor of the node
     * @param category Category of the node. Will be used in the view's context menu for adding nodes
     */
    public registerNodeType(type: AbstractNodeConstructor, options?: IRegisterNodeTypeOptions): void {
        if (this.events.beforeRegisterNodeType.emit({ type, options })) {
            return;
        }
        const nodeInstance = new type();
        this._nodeTypes.set(nodeInstance.type, {
            type,
            category: options?.category ?? "default",
            title: options?.title ?? nodeInstance.title,
        });
        this.events.registerNodeType.emit({ type, options });
    }

    /**
     * Load a state
     * @param state State to load
     */
    public load(state: IEditorState): void {
        state = this.hooks.load.execute(state);
        this._graph = new Graph(this);
        this._graph.load(state.graph);
    }

    /**
     * Save a state
     * @returns Current state
     */
    public save(): IEditorState {
        const state = {
            graph: this.graph.save(),
        };
        return this.hooks.save.execute(state);
    }

    /**
     * Register a plugin
     * @param plugin Plugin to register
     * @returns Whether the plugin was successfully registered
     */
    public use(plugin: IPlugin): boolean {
        if (this.events.beforeUsePlugin.emit(plugin)) {
            return false;
        }
        this._plugins.add(plugin);
        plugin.register(this);
        this.events.usePlugin.emit(plugin);
        return true;
    }
}
