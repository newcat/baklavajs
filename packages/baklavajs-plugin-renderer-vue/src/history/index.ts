import { Ref, ref, watch } from "vue";
import { Graph } from "@baklavajs/core";

import type { ICommandHandler } from "../commands";

import { IStep } from "./step";
import NodeStep from "./nodeStep";
import ConnectionStep from "./connectionStep";
import TransactionStep from "./transactionStep";

export const UNDO_COMMAND = "UNDO";
export const REDO_COMMAND = "REDO";
export const START_TRANSACTION_COMMAND = "START_TRANSACTION";
export const COMMIT_TRANSACTION_COMMAND = "COMMIT_TRANSACTION";

export interface IHistory {
    maxSteps: Ref<number>;
}

export function useHistory(graph: Ref<Graph>, commandHandler: ICommandHandler): IHistory {
    const token = Symbol("HistoryToken");

    const maxSteps = ref(200);
    const steps = ref<IStep[]>([]);
    const changeBySelf = ref(false);
    const currentIndex = ref(-1);

    const activeTransaction = ref(false);
    const transactionSteps = ref<IStep[]>([]);

    const addStep = (step: IStep) => {
        if (changeBySelf.value) {
            return;
        }

        if (activeTransaction.value) {
            transactionSteps.value.push(step);
        } else {
            if (currentIndex.value !== steps.value.length - 1) {
                steps.value = steps.value.slice(0, currentIndex.value + 1);
            }

            steps.value.push(step);
            currentIndex.value++;

            while (steps.value.length > maxSteps.value) {
                steps.value.shift();
            }
        }
    };

    const startTransaction = () => {
        activeTransaction.value = true;
    };

    const commitTransaction = () => {
        activeTransaction.value = false;
        if (transactionSteps.value.length > 0) {
            addStep(new TransactionStep(transactionSteps.value));
            transactionSteps.value = [];
        }
    };

    const undo = () => {
        if (steps.value.length === 0 || currentIndex.value === -1) {
            return;
        }
        changeBySelf.value = true;
        steps.value[currentIndex.value--].undo(graph.value);
        changeBySelf.value = false;
    };

    const redo = () => {
        if (steps.value.length === 0 || currentIndex.value >= steps.value.length - 1) {
            return;
        }
        changeBySelf.value = true;
        steps.value[++currentIndex.value].redo(graph.value);
        changeBySelf.value = false;
    };

    watch(
        graph,
        (oldGraph, newGraph) => {
            if (oldGraph) {
                oldGraph.events.addNode.removeListener(token);
                oldGraph.events.removeNode.removeListener(token);
                oldGraph.events.addConnection.removeListener(token);
                oldGraph.events.removeConnection.removeListener(token);
            }
            if (newGraph) {
                newGraph.events.addNode.addListener(token, (node) => {
                    addStep(new NodeStep("addNode", node.id));
                });
                newGraph.events.removeNode.addListener(token, (node) => {
                    addStep(new NodeStep("removeNode", node.save()));
                });
                newGraph.events.addConnection.addListener(token, (conn) => {
                    addStep(new ConnectionStep("addConnection", conn.id));
                });
                newGraph.events.removeConnection.addListener(token, (conn) => {
                    addStep(new ConnectionStep("removeConnection", conn));
                });
                // TODO: Also add moving nodes to the history
            }
        },
        { immediate: true }
    );

    commandHandler.registerCommand(UNDO_COMMAND, undo);
    commandHandler.registerCommand(REDO_COMMAND, redo);
    commandHandler.registerCommand(START_TRANSACTION_COMMAND, startTransaction);
    commandHandler.registerCommand(COMMIT_TRANSACTION_COMMAND, commitTransaction);

    commandHandler.registerHotkey(["Control", "z"], UNDO_COMMAND);
    commandHandler.registerHotkey(["Control", "y"], REDO_COMMAND);

    return {
        maxSteps,
    };
}
