<template>
    <div id="app">
        <div class="tabs">
            <button :class="{ active: activeTab === 'dependency' }" @click="activeTab = 'dependency'">
                Dependency Engine
            </button>
            <button :class="{ active: activeTab === 'forward' }" @click="activeTab = 'forward'">Forward Engine</button>
        </div>

        <BaklavaEditor v-if="activeTab === 'dependency'" :view-model="dep.view">
            <template #node="nodeProps">
                <CommentNodeRenderer v-if="nodeProps.node.type === 'CommentNode'" v-bind="nodeProps" />
                <NodeComponent v-else v-bind="nodeProps" />
            </template>
        </BaklavaEditor>
        <BaklavaEditor v-if="activeTab === 'forward'" :view-model="fwd.view">
            <template #node="nodeProps">
                <CommentNodeRenderer v-if="nodeProps.node.type === 'CommentNode'" v-bind="nodeProps" />
                <NodeComponent v-else v-bind="nodeProps" />
            </template>
        </BaklavaEditor>

        <div class="actions">
            <button v-if="activeTab === 'dependency'" @click="calculate">Calculate</button>
            <button v-else @click="runForward">Run Forward Engine</button>
            <button @click="active.save()">Save</button>
            <button @click="active.load()">Load</button>
            <button @click="active.setSelectItems()">Set Select Items</button>
            <button @click="active.changeGridSize()">Change Grid Size</button>
            <button @click="active.createSubgraph()">Create Subgraph</button>
            <button @click="active.saveAndLoad()">Save and Load</button>
            <button @click="active.changeSidebarWidth()">SidebarWidth</button>
            <button @click="active.clearHistory()">Clear History</button>
            <button @click="active.zoomToFitRandomNode()">Zoom to Random Node</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NodeInstanceOf, Editor } from "@baklavajs/core";
import { BaklavaEditor, Components, SelectInterface, useBaklava, Commands, DEFAULT_TOOLBAR_COMMANDS } from "../src";
import { BaseEngine, DependencyEngine, ForwardEngine, applyResult } from "@baklavajs/engine";
import { BaklavaInterfaceTypes } from "@baklavajs/interface-types";

import TestNode from "./TestNode";
import OutputNode from "./OutputNode";
import BuilderTestNode from "./BuilderTestNode";
import MathNode from "./MathNode";
import AdvancedNode from "./AdvancedNode";
import CommentNode from "./CommentNode";
import InterfaceTestNode from "./InterfaceTestNode";
import SelectTestNode from "./SelectTestNode";
import SidebarNode from "./SidebarNode";
import DynamicNode from "./DynamicNode";
import UpdateTestNode from "./UpdateTestNode";
import MultiInputNode from "./MultiInputNode";
import { DialogNode } from "./DialogNode";
import ReactiveOutputTestNode from "./ReactiveOutputTestNode";

import ForwardTriggerNode from "./ForwardTriggerNode";
import ForwardBranchNode from "./ForwardBranchNode";
import ForwardForLoopNode from "./ForwardForLoopNode";
import ForwardPrintNode from "./ForwardPrintNode";

import { stringType, numberType, booleanType } from "./interfaceTypes";
import CommentNodeRenderer from "./CommentNodeRenderer.vue";
import { computed, defineComponent, h, markRaw, ref } from "vue";

const NodeComponent = Components.Node;

function setupEditorInstance() {
    const view = useBaklava();
    const editor = view.editor;

    view.settings.enableMinimap = true;
    view.settings.sidebar.resizable = false;
    view.settings.displayValueOnHover = true;
    view.settings.nodes.resizable = true;
    view.settings.nodes.reverseY = false;
    view.settings.contextMenu.additionalItems = [
        { isDivider: true },
        { label: "Copy", command: Commands.COPY_COMMAND },
        { label: "Paste", command: Commands.PASTE_COMMAND },
    ];

    const CLEAR_ALL_COMMAND = "CLEAR_ALL";
    view.commandHandler.registerCommand(CLEAR_ALL_COMMAND, {
        execute: () => {
            view.displayedGraph.nodes.forEach((node) => {
                view.displayedGraph.removeNode(node);
            });
        },
        canExecute: () => view.displayedGraph.nodes.length > 0,
    });
    view.settings.toolbar.commands = [
        ...DEFAULT_TOOLBAR_COMMANDS,
        {
            command: CLEAR_ALL_COMMAND,
            title: "Clear All",
            icon: markRaw(
                defineComponent(() => {
                    return () => h("div", "Clear All");
                }),
            ),
        },
    ];

    editor.registerNodeType(TestNode, { category: "Tests" });
    editor.registerNodeType(OutputNode, { category: "Outputs" });
    editor.registerNodeType(BuilderTestNode, { category: "Tests" });
    editor.registerNodeType(DialogNode);
    editor.registerNodeType(MathNode);
    editor.registerNodeType(AdvancedNode);
    editor.registerNodeType(CommentNode, { title: "Comment" });
    editor.registerNodeType(InterfaceTestNode);
    editor.registerNodeType(SelectTestNode);
    editor.registerNodeType(SidebarNode);
    editor.registerNodeType(DynamicNode);
    editor.registerNodeType(UpdateTestNode);
    editor.registerNodeType(ReactiveOutputTestNode);
    editor.registerNodeType(MultiInputNode);

    return {
        view,
        editor,
        setupInterfaceTypes(engine: BaseEngine<any, any>) {
            const nodeInterfaceTypes = new BaklavaInterfaceTypes(editor, { viewPlugin: view, engine });
            nodeInterfaceTypes.addTypes(stringType, numberType, booleanType);
        },
    };
}

function createActions(view: ReturnType<typeof useBaklava>, editor: Editor, storageKey: string) {
    return {
        save() {
            const state = JSON.stringify(editor.save());
            console.log("Saving to localstorage", state);
            window.localStorage.setItem(storageKey, state);
        },
        load() {
            const state = window.localStorage.getItem(storageKey);
            if (!state) return;
            try {
                editor.load(JSON.parse(state));
                console.log("Loaded state from localStorage");
            } catch (e) {
                console.error(e);
            }
        },
        saveAndLoad() {
            editor.load(editor.save());
        },
        setSelectItems() {
            for (const node of editor.graph.nodes) {
                if (node.type === "SelectTestNode") {
                    const n = node as unknown as NodeInstanceOf<typeof SelectTestNode>;
                    const sel = n.inputs.advanced as SelectInterface<number | undefined>;
                    sel.items = [
                        { text: "X", value: 1 },
                        { text: node.id, value: 2 },
                    ];
                }
            }
        },
        changeGridSize() {
            view.settings.background.gridSize = Math.round(Math.random() * 100) + 100;
        },
        createSubgraph() {
            view.commandHandler.executeCommand<Commands.CreateSubgraphCommand>(Commands.CREATE_SUBGRAPH_COMMAND);
        },
        changeSidebarWidth() {
            view.settings.sidebar.width = Math.round(Math.random() * 500) + 300;
            view.settings.sidebar.resizable = !view.settings.sidebar.resizable;
        },
        clearHistory() {
            view.commandHandler.executeCommand<Commands.ClearHistoryCommand>(Commands.CLEAR_HISTORY_COMMAND);
        },
        zoomToFitRandomNode() {
            if (view.displayedGraph.nodes.length === 0) return;
            const nodes = view.displayedGraph.nodes;
            const node = nodes[Math.floor(Math.random() * nodes.length)];
            view.commandHandler.executeCommand<Commands.ZoomToFitNodesCommand>(
                Commands.ZOOM_TO_FIT_NODES_COMMAND,
                true,
                [node],
            );
        },
    };
}

// --- Dependency Engine instance ---
const dep = setupEditorInstance();
(window as any).editor = dep.editor;
const token = Symbol("token");
const engine = new DependencyEngine(dep.editor);
engine.events.afterRun.subscribe(token, (r) => {
    engine.pause();
    applyResult(r, dep.editor);
    engine.resume();
    console.log(r);
});
engine.hooks.gatherCalculationData.subscribe(token, () => "def");
engine.start();
dep.setupInterfaceTypes(engine);
const depActions = createActions(dep.view, dep.editor, "state");
depActions.load();

// --- Forward Engine instance ---
const fwd = setupEditorInstance();
const forwardToken = Symbol("forwardToken");
const forwardEngine = new ForwardEngine(fwd.editor);
forwardEngine.events.afterRun.subscribe(forwardToken, (r) => {
    forwardEngine.pause();
    applyResult(r, fwd.editor);
    forwardEngine.resume();
    console.log("Forward Engine result:", r);
});
fwd.editor.registerNodeType(ForwardTriggerNode, { category: "Forward Engine" });
fwd.editor.registerNodeType(ForwardBranchNode, { category: "Forward Engine" });
fwd.editor.registerNodeType(ForwardForLoopNode, { category: "Forward Engine" });
fwd.editor.registerNodeType(ForwardPrintNode, { category: "Forward Engine" });
fwd.setupInterfaceTypes(forwardEngine);
const fwdActions = createActions(fwd.view, fwd.editor, "state-forward");
fwdActions.load();

// --- Tab switcher ---
const activeTab = ref<"dependency" | "forward">("dependency");
const active = computed(() => (activeTab.value === "dependency" ? depActions : fwdActions));

const calculate = async () => {
    console.log(await engine.runOnce("def"));
};

const runForward = async () => {
    const triggerNode = fwd.editor.graph.nodes.find((n) => n.type === "ForwardTriggerNode");
    if (!triggerNode) {
        console.warn("No ForwardTriggerNode found in the graph");
        return;
    }
    console.log("Forward Engine result:", await forwardEngine.runOnce(undefined, triggerNode, undefined));
};
</script>

<style>
body,
html {
    margin: 0;
    padding: 0;
    background: #1e1e1e;
    color: #ccc;
    font-family: sans-serif;
}

#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.tabs {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #1e1e1e;
    flex-shrink: 0;
}

.tabs button {
    padding: 4px 12px;
    cursor: pointer;
    background: #333;
    color: #ccc;
    border: 1px solid #555;
}

.tabs button.active {
    background: #555;
    color: #fff;
}

.baklava-editor {
    flex: 1;
    min-height: 0;
}

.actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}
</style>
