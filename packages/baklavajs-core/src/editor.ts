import { PreventableBaklavaEvent, BaklavaEvent, SequentialHook } from "@baklavajs/events";
import type { NodeInterface } from "./nodeInterface";
import type { AbstractNode, INodeState, AbstractNodeConstructor } from "./node";
import type { IAddConnectionEventData, IAddNodeTypeEventData } from "./eventDataTypes";
import { Connection, DummyConnection, IConnection, IConnectionState } from "./connection";

export interface IPlugin {
    type: string;
    register(editor: Editor): void;
}

export interface IState extends Record<string, any> {
    nodes: Array<INodeState<unknown, unknown>>;
    connections: IConnectionState[];
}

/** The main model class for BaklavaJS */
export class Editor {
    private _plugins: Set<IPlugin> = new Set();
    private _nodeTypes: Map<string, AbstractNodeConstructor> = new Map();
    private _nodeCategories: Map<string, string[]> = new Map([["default", []]]);

    public events = {
        beforeRegisterNodeType: new PreventableBaklavaEvent<IAddNodeTypeEventData>(),
        registerNodeType: new BaklavaEvent<IAddNodeTypeEventData>(),
        beforeUsePlugin: new PreventableBaklavaEvent<IPlugin>(),
        usePlugin: new BaklavaEvent<IPlugin>(),
    };

    public hooks = {
        save: new SequentialHook<IState>(),
        load: new SequentialHook<IState>(),
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
    public load(state: IState): void {
        // Clear current state
        // TODO: Is this even necessary?
        /*
        for (let i = this.connections.length - 1; i >= 0; i--) {
            this.removeConnection(this.connections[i]);
        }
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            this.removeNode(this.nodes[i]);
        }*/

        // Load state
        for (const n of state.nodes) {
            // find node type
            const nt = this.nodeTypes.get(n.type);
            if (!nt) {
                console.warn(`Node type ${n.type} is not registered`);
                continue;
            }

            const node = new nt();
            this.addNode(node);
            node.load(n);
        }

        for (const c of state.connections) {
            const fromIf = this.findNodeInterface(c.from);
            const toIf = this.findNodeInterface(c.to);
            if (!fromIf) {
                console.warn(`Could not find interface with id ${c.from}`);
                continue;
            } else if (!toIf) {
                console.warn(`Could not find interface with id ${c.to}`);
                continue;
            } else {
                this.addConnection(fromIf, toIf);
            }
        }

        this.hooks.load.execute(state);
    }

    /**
     * Save a state
     * @returns Current state
     */
    public save(): IState {
        const state = {
            nodes: this.nodes.map((n) => n.save()),
            connections: this.connections.map((c) => ({
                id: c.id,
                from: c.from.id,
                to: c.to.id,
            })),
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
