import Connection from "./connection/ConnectionView.vue";
import ConnectionWrapper from "./connection/ConnectionWrapper.vue";
import TemporaryConnection from "./connection/TemporaryConnection.vue";
import Node from "./node/Node.vue";
import NodeInterface from "./node/NodeInterface.vue";
import Sidebar from "./components/Sidebar.vue";

export const Components = {
    Connection,
    ConnectionWrapper,
    TemporaryConnection,
    Node,
    NodeInterface,
    Sidebar,
};

export { default as EditorComponent } from "./editor/Editor.vue";
export * from "./nodeinterfaces";
export * from "./viewPlugin";
