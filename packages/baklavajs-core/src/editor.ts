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
import { GraphTemplate, IGraphTemplateState } from "./graphTemplate";
import { createGraphNodeType } from "./graphNode";

export interface IPlugin {
    type: string;
    register(editor: Editor): void;
}

export interface IEditorState extends Record<string, any> {
    graph: IGraphState;
    graphTemplates: IGraphTemplateState[];
}

export interface INodeTypeInformation extends Required<IRegisterNodeTypeOptions> {
    type: AbstractNodeConstructor;
}

/** The main model class for BaklavaJS */
export class Editor implements IBaklavaEventEmitter, IBaklavaTapable {
    private _plugins: Set<IPlugin> = new Set();
    private _nodeTypes: Map<string, INodeTypeInformation> = new Map();
    private _graph = new Graph(this);
    private _graphTemplates: GraphTemplate[] = [];

    public events = {
        loaded: new BaklavaEvent<void>(),
        beforeRegisterNodeType: new PreventableBaklavaEvent<IAddNodeTypeEventData>(),
        registerNodeType: new BaklavaEvent<IAddNodeTypeEventData>(),
        beforeAddGraphTemplate: new PreventableBaklavaEvent<GraphTemplate>(),
        addGraphTemplate: new BaklavaEvent<GraphTemplate>(),
        beforeRemoveGraphTemplate: new PreventableBaklavaEvent<GraphTemplate>(),
        removeGraphTemplate: new BaklavaEvent<GraphTemplate>(),
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

    public get graphTemplates(): ReadonlyArray<GraphTemplate> {
        return this._graphTemplates;
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

    public addGraphTemplate(template: GraphTemplate): void {
        if (this.events.beforeAddGraphTemplate.emit(template)) {
            return;
        }
        this._graphTemplates.push(template);

        const nt = createGraphNodeType(template);
        this.registerNodeType(nt, { category: "Subgraphs", title: template.name });

        this.events.addGraphTemplate.emit(template);
    }

    public removeGraphTemplate(template: GraphTemplate): void {
        if (this.graphTemplates.includes(template)) {
            if (this.events.beforeRemoveGraphTemplate.emit(template)) {
                return;
            }
            this._graphTemplates.splice(this._graphTemplates.indexOf(template), 1);
            this.events.removeGraphTemplate.emit(template);
        }
    }

    /**
     * Load a state
     * @param state State to load
     */
    public load(state: IEditorState): void {
        state = this.hooks.load.execute(state);

        state.graphTemplates.forEach((tState) => {
            const template = new GraphTemplate(tState, this);
            this.addGraphTemplate(template);
        });

        this._graph = new Graph(this);
        this._graph.load(state.graph);

        this.events.loaded.emit();
    }

    /**
     * Save a state
     * @returns Current state
     */
    public save(): IEditorState {
        const state: IEditorState = {
            graph: this.graph.save(),
            graphTemplates: this.graphTemplates.map((t) => t.save()),
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
