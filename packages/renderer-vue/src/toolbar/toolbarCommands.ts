import { Component, markRaw } from "vue";
import {
    COPY_COMMAND,
    PASTE_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CREATE_SUBGRAPH_COMMAND,
    SAVE_SUBGRAPH_COMMAND,
    START_SELECTION_BOX_COMMAND,
    DELETE_NODES_COMMAND,
    SWITCH_TO_MAIN_GRAPH_COMMAND,
    ZOOM_TO_FIT_GRAPH_COMMAND,
} from "../commandList";
import * as Icons from "../icons";

export interface ToolbarCommand {
    command: string;
    title: string;
    icon?: Component;
}

export const TOOLBAR_COMMANDS: Record<string, ToolbarCommand> = {
    COPY: { command: COPY_COMMAND, title: "Copy", icon: markRaw(Icons.Copy) },
    PASTE: { command: PASTE_COMMAND, title: "Paste", icon: markRaw(Icons.Clipboard) },
    DELETE_NODES: { command: DELETE_NODES_COMMAND, title: "Delete selected nodes", icon: markRaw(Icons.Trash) },
    UNDO: { command: UNDO_COMMAND, title: "Undo", icon: markRaw(Icons.ArrowBackUp) },
    REDO: { command: REDO_COMMAND, title: "Redo", icon: markRaw(Icons.ArrowForwardUp) },
    ZOOM_TO_FIT_GRAPH: { command: ZOOM_TO_FIT_GRAPH_COMMAND, title: "Zoom to Fit", icon: markRaw(Icons.ZoomScan) },
    START_SELECTION_BOX: { command: START_SELECTION_BOX_COMMAND, title: "Box Select", icon: markRaw(Icons.SelectAll) },
    CREATE_SUBGRAPH: { command: CREATE_SUBGRAPH_COMMAND, title: "Create Subgraph", icon: markRaw(Icons.Hierarchy2) },
};
export const DEFAULT_TOOLBAR_COMMANDS: ToolbarCommand[] = Object.values(TOOLBAR_COMMANDS);

export const TOOLBAR_SUBGRAPH_COMMANDS: Record<string, ToolbarCommand> = {
    SAVE_SUBGRAPH: { command: SAVE_SUBGRAPH_COMMAND, title: "Save Subgraph", icon: markRaw(Icons.DeviceFloppy) },
    SWITCH_TO_MAIN_GRAPH: {
        command: SWITCH_TO_MAIN_GRAPH_COMMAND,
        title: "Back to Main Graph",
        icon: markRaw(Icons.ArrowLeft),
    },
};
export const DEFAULT_TOOLBAR_SUBGRAPH_COMMANDS: ToolbarCommand[] = Object.values(TOOLBAR_SUBGRAPH_COMMANDS);
