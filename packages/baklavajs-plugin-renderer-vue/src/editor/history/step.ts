import { Graph } from "@baklavajs/core";

export interface IStep {
    type: string;
    undo(graph: Graph): void;
    redo(graph: Graph): void;
}
