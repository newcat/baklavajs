import { IAddConnectionEventData, IAddNodeTypeEventData } from "./eventDataTypes";
import { IConnection } from "./connection";
import { IPlugin } from "./plugin";
import { IState } from "./state";
import { AbstractNode } from "./node";
import { INodeInterface } from "./nodeInterface";
import { IBaklavaEvent, IPreventableBaklavaEvent, IHook } from "../../baklavajs-events/types";

export type NodeConstructor = new () => AbstractNode;

export interface IEditor {

    events: {
        beforeRegisterNodeType: IPreventableBaklavaEvent<IAddNodeTypeEventData>,
        registerNodeType: IBaklavaEvent<IAddNodeTypeEventData>,
        beforeAddNode: IPreventableBaklavaEvent<AbstractNode>,
        addNode: IBaklavaEvent<AbstractNode>,
        beforeRemoveNode: IPreventableBaklavaEvent<AbstractNode>,
        removeNode: IBaklavaEvent<AbstractNode>,
        beforeAddConnection: IPreventableBaklavaEvent<IAddConnectionEventData>,
        addConnection: IBaklavaEvent<IConnection>,
        checkConnection: IPreventableBaklavaEvent<IAddConnectionEventData>,
        beforeRemoveConnection: IPreventableBaklavaEvent<IConnection>,
        removeConnection: IBaklavaEvent<IConnection>,
        beforeUsePlugin: IPreventableBaklavaEvent<IPlugin>,
        usePlugin: IBaklavaEvent<IPlugin>
    };

    hooks: {
        save: IHook<IState>,
        load: IHook<IState>
    };

    readonly nodes: ReadonlyArray<AbstractNode>;
    readonly connections: ReadonlyArray<IConnection>;
    readonly nodeTypes: ReadonlyMap<string, NodeConstructor>;
    readonly nodeCategories: ReadonlyMap<string, string[]>;
    readonly plugins: ReadonlySet<IPlugin>;

    registerNodeType(typeName: string, type: NodeConstructor, category?: string): void;
    addNode(node: AbstractNode): AbstractNode|undefined;
    removeNode(node: AbstractNode): void;
    addConnection(from: INodeInterface<unknown>, to: INodeInterface<unknown>): IConnection|undefined;
    removeConnection(connection: IConnection): void;
    checkConnection(from: INodeInterface<unknown>, to: INodeInterface<unknown>): false|IConnection;
    load(state: IState): void;
    save(): IState;
    use(plugin: IPlugin): boolean;
    generateId(prefix?: string): string;
    findNodeInterface(id: string): INodeInterface<unknown>|undefined;

}
