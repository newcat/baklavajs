import { IAddConnectionEventData, IAddNodeTypeEventData } from "./eventDataTypes";
import { IConnection } from "./connection";
import { IPlugin } from "./plugin";
import { IState } from "./state";
import { INode } from "./node";
import { INodeInterface } from "./nodeInterface";
import { IBaklavaEvent, IPreventableBaklavaEvent, IHook } from "../../baklavajs-events/types";

export type NodeConstructor = new () => INode;

export interface IEditor {

    events: {
        beforeRegisterNodeType: IPreventableBaklavaEvent<IAddNodeTypeEventData>,
        registerNodeType: IBaklavaEvent<IAddNodeTypeEventData>,
        beforeAddNode: IPreventableBaklavaEvent<INode>,
        addNode: IBaklavaEvent<INode>,
        beforeRemoveNode: IPreventableBaklavaEvent<INode>,
        removeNode: IBaklavaEvent<INode>,
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

    readonly nodes: ReadonlyArray<INode>;
    readonly connections: ReadonlyArray<IConnection>;
    readonly nodeTypes: ReadonlyMap<string, NodeConstructor>;
    readonly nodeCategories: ReadonlyMap<string, string[]>;
    readonly plugins: ReadonlySet<IPlugin>;

    registerNodeType(typeName: string, type: NodeConstructor, category?: string): void;
    addNode(node: INode): INode|undefined;
    removeNode(node: INode): void;
    addConnection(from: INodeInterface, to: INodeInterface): IConnection|undefined;
    removeConnection(connection: IConnection): void;
    checkConnection(from: INodeInterface, to: INodeInterface): false|IConnection;
    load(state: IState): void;
    save(): IState;
    use(plugin: IPlugin): boolean;
    generateId(prefix?: string): string;
    findNodeInterface(id: string): INodeInterface|undefined;

}
