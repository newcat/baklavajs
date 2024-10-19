import { reactive, Ref, ref, watch } from "vue";
import { Graph } from "@baklavajs/core";

import type { ICommandHandler, ICommand } from "../commands";

import { IStep } from "./step";
import NodeStep from "./nodeStep";
import ConnectionStep from "./connectionStep";
import TransactionStep from "./transactionStep";

export const UNDO_COMMAND = "UNDO";
export const REDO_COMMAND = "REDO";
export const START_TRANSACTION_COMMAND = "START_TRANSACTION";
export const COMMIT_TRANSACTION_COMMAND = "COMMIT_TRANSACTION";
export const CLEAR_HISTORY_COMMAND = "CLEAR_HISTORY";

export type UndoCommand = ICommand<void>;
export type RedoCommand = ICommand<void>;
export type StartTransactionCommand = ICommand<void>;
export type CommitTransactionCommand = ICommand<void>;
export type ClearHistoryCommand = ICommand<void>;

export interface IHistory {
    maxSteps: number;
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

            while (steps.value.length > maxSteps.value) {
                steps.value.shift();
            }

            currentIndex.value = steps.value.length - 1;
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

    const canUndo = () => steps.value.length !== 0 && currentIndex.value !== -1;
    const undo = () => {
        if (!canUndo()) {
            return;
        }
        changeBySelf.value = true;
        steps.value[currentIndex.value--].undo(graph.value);
        changeBySelf.value = false;
    };

    const canRedo = () => steps.value.length !== 0 && currentIndex.value < steps.value.length - 1;
    const redo = () => {
        if (!canRedo()) {
            return;
        }
        changeBySelf.value = true;
        steps.value[++currentIndex.value].redo(graph.value);
        changeBySelf.value = false;
    };

    const clear = () => {
        steps.value = [];
        currentIndex.value = -1;
    };

    watch(
        graph,
        (newGraph, oldGraph) => {
            if (oldGraph) {
                oldGraph.events.addNode.unsubscribe(token);
                oldGraph.events.removeNode.unsubscribe(token);
                oldGraph.events.addConnection.unsubscribe(token);
                oldGraph.events.removeConnection.unsubscribe(token);
            }
            if (newGraph) {
                newGraph.events.addNode.subscribe(token, (node) => {
                    addStep(new NodeStep("addNode", node.id));
                });
                newGraph.events.removeNode.subscribe(token, (node) => {
                    addStep(new NodeStep("removeNode", node.save()));
                });
                newGraph.events.addConnection.subscribe(token, (conn) => {
                    addStep(new ConnectionStep("addConnection", conn.id));
                });
                newGraph.events.removeConnection.subscribe(token, (conn) => {
                    addStep(new ConnectionStep("removeConnection", conn));
                });
                // TODO: Also add moving nodes to the history
            }
        },
        { immediate: true },
    );

    commandHandler.registerCommand<UndoCommand>(UNDO_COMMAND, {
        canExecute: canUndo,
        execute: undo,
    });
    commandHandler.registerCommand<RedoCommand>(REDO_COMMAND, {
        canExecute: canRedo,
        execute: redo,
    });
    commandHandler.registerCommand<StartTransactionCommand>(START_TRANSACTION_COMMAND, {
        canExecute: () => !activeTransaction.value,
        execute: startTransaction,
    });
    commandHandler.registerCommand<CommitTransactionCommand>(COMMIT_TRANSACTION_COMMAND, {
        canExecute: () => activeTransaction.value,
        execute: commitTransaction,
    });
    commandHandler.registerCommand<ClearHistoryCommand>(CLEAR_HISTORY_COMMAND, {
        canExecute: () => steps.value.length > 0,
        execute: clear,
    });

    commandHandler.registerHotkey(["Control", "z"], UNDO_COMMAND);
    commandHandler.registerHotkey(["Control", "y"], REDO_COMMAND);

    return reactive({
        maxSteps,
    });
}
