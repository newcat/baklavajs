import NodeView from "./components/node/Node.vue";

export interface NodeMoveEventData {
    nodeView: NodeView;
    newPosition: { x: number; y: number };
}
