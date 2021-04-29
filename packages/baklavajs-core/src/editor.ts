import { PreventableBaklavaEvent, BaklavaEvent, SequentialHook } from "@baklavajs/events";
import type { AbstractNodeConstructor } from "./node";
import type { IAddNodeTypeEventData } from "./eventDataTypes";
import { Graph, IGraphState } from "./graph";

export interface IPlugin {
    type: string;
    register(editor: Editor): void;
}

export interface EditorState extends Record<string, any> {
    graph: IGraphState;
}

/** The main model class for BaklavaJS */
export class Editor {
    private _plugins: Set<IPlugin> = new Set();
    private _nodeTypes: Map<string, AbstractNodeConstructor> = new Map();
    private _nodeCategories: Map<string, string[]> = new Map([["default", []]]);
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
        save: new SequentialHook<EditorState>(),
        load: new SequentialHook<EditorState>(),
    };

    /** List of all registered node types */
    public get nodeTypes(): ReadonlyMap<string, AbstractNodeConstructor> {
        return this._nodeTypes;
    }

    /** Mapping of nodes to node categories */
    public get nodeCategories(): ReadonlyMap<string, string[]> {
        return this._nodeCategories;
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
     * @param typeName Name of the node (must be equal to the node's `type` field)
     * @param type Actual type / constructor of the node
     * @param category Category of the node. Will be used in the view's context menu for adding nodes
     */
    public registerNodeType(typeName: string, type: AbstractNodeConstructor, category = "default"): void {
        if (this.events.beforeRegisterNodeType.emit({ typeName, type, category })) {
            return;
        }
        this._nodeTypes.set(typeName, type);
        if (!this.nodeCategories.has(category)) {
            this._nodeCategories.set(category, []);
        }
        this.nodeCategories.get(category)!.push(typeName);
        this.events.registerNodeType.emit({ typeName, type, category });
    }

    /**
     * Load a state
     * @param state State to load
     */
    public load(state: EditorState): void {
        state = this.hooks.load.execute(state);
        this._graph = new Graph(this);
        this._graph.load(state.graph);
    }

    /**
     * Save a state
     * @returns Current state
     */
    public save(): EditorState {
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
