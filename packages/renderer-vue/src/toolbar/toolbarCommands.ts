import { Component } from "vue";
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
    COPY: { command: COPY_COMMAND, title: "Copy", icon: Icons.Copy },
    PASTE: { command: PASTE_COMMAND, title: "Paste", icon: Icons.Clipboard },
    DELETE_NODES: { command: DELETE_NODES_COMMAND, title: "Delete selected nodes", icon: Icons.Trash },
    UNDO: { command: UNDO_COMMAND, title: "Undo", icon: Icons.ArrowBackUp },
    REDO: { command: REDO_COMMAND, title: "Redo", icon: Icons.ArrowForwardUp },
    ZOOM_TO_FIT_GRAPH: { command: ZOOM_TO_FIT_GRAPH_COMMAND, title: "Zoom to Fit", icon: Icons.ZoomScan },
    START_SELECTION_BOX: { command: START_SELECTION_BOX_COMMAND, title: "Box Select", icon: Icons.SelectAll },
    CREATE_SUBGRAPH: { command: CREATE_SUBGRAPH_COMMAND, title: "Create Subgraph", icon: Icons.Hierarchy2 },
};
export const DEFAULT_TOOLBAR_COMMANDS: ToolbarCommand[] = Object.values(TOOLBAR_COMMANDS);

export const TOOLBAR_SUBGRAPH_COMMANDS: Record<string, ToolbarCommand> = {
    SAVE_SUBGRAPH: { command: SAVE_SUBGRAPH_COMMAND, title: "Save Subgraph", icon: Icons.DeviceFloppy },
    SWITCH_TO_MAIN_GRAPH: { command: SWITCH_TO_MAIN_GRAPH_COMMAND, title: "Back to Main Graph", icon: Icons.ArrowLeft },
};
export const DEFAULT_TOOLBAR_SUBGRAPH_COMMANDS: ToolbarCommand[] = Object.values(TOOLBAR_SUBGRAPH_COMMANDS);
