export { default as Editor } from "./editor/Editor.vue";

import Connection from "./connection/ConnectionView.vue";
import ConnectionWrapper from "./connection/ConnectionWrapper.vue";
import TemporaryConnection from "./connection/TemporaryConnection.vue";
import Node from "./node/Node.vue";
import NodeInterface from "./node/NodeInterface.vue";
import NodeOption from "./node/NodeOption.vue";
import Sidebar from "./components/Sidebar.vue";

export const Components = {
    Connection,
    ConnectionWrapper,
    TemporaryConnection,
    Node,
    NodeInterface,
    NodeOption,
    Sidebar,
};

export * from "./viewPlugin";
