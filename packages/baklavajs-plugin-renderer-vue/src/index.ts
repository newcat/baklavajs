/**
 * @module @baklavajs/plugin-renderer-vue
 */

import Connection from "./connection/ConnectionView.vue";
import ConnectionWrapper from "./connection/ConnectionWrapper.vue";
import TemporaryConnection from "./connection/TemporaryConnection.vue";
import Node from "./node/Node.vue";
import NodeInterface from "./node/NodeInterface.vue";
import ContextMenu from "./components/ContextMenu.vue";
import Minimap from "./components/Minimap.vue";
import Sidebar from "./components/Sidebar.vue";

export const Components = {
    Connection,
    ConnectionWrapper,
    TemporaryConnection,
    Node,
    NodeInterface,
    ContextMenu,
    Minimap,
    Sidebar,
};

export { default as EditorComponent } from "./editor/Editor.vue";
export * from "./nodeinterfaces";
export * from "./useBaklava";
export * from "./utility";

export * as Commands from "./commandList";

import "./styles/all.scss";
