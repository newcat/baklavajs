<template>
    <div id="app">
        <baklava-editor :view-model="baklavaView">
            <template #node="nodeProps">
                <CustomNodeRenderer :key="nodeProps.node.id" v-bind="nodeProps" />
            </template>
        </baklava-editor>
        <button @click="calculate">Calculate</button>
        <button @click="save">Save</button>
        <button @click="load">Load</button>
        <button @click="setSelectItems">Set Select Items</button>
        <button @click="changeGridSize">Change Grid Size</button>
        <button @click="createSubgraph">Create Subgraph</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { NodeInstanceOf } from "@baklavajs/core";
import { EditorComponent, SelectInterface, useBaklava, Commands } from "../src";
import { DependencyEngine, applyResult } from "@baklavajs/engine";
import { BaklavaInterfaceTypes } from "@baklavajs/interface-types";

import CustomNodeRenderer from "./CustomNodeRenderer";

import TestNode from "./TestNode";
import OutputNode from "./OutputNode";
import BuilderTestNode from "./BuilderTestNode";
import MathNode from "./MathNode";
import AdvancedNode from "./AdvancedNode";
import CommentNode from "./CommentNode";
import InterfaceTestNode from "./InterfaceTestNode";
import SelectTestNode from "./SelectTestNode";
import SidebarNode from "./SidebarNode";

import { stringType, numberType, booleanType } from "./interfaceTypes";

export default defineComponent({
    components: {
        CustomNodeRenderer,
        "baklava-editor": EditorComponent,
    },
    setup() {
        const token = Symbol("token");
        const baklavaView = useBaklava();
        const editor = baklavaView.editor;

        baklavaView.settings.enableMinimap = true;

        const engine = new DependencyEngine(editor);
        engine.events.afterRun.subscribe(token, (r) => {
            engine.pause();
            applyResult(r, editor);
            engine.resume();
            for (const v of r.values()) {
                console.log(v);
            }
        });
        engine.hooks.gatherCalculationData.subscribe(token, () => "def");
        engine.start();

        const nodeInterfaceTypes = new BaklavaInterfaceTypes(editor, {
            viewPlugin: baklavaView,
            engine,
        });
        nodeInterfaceTypes.addTypes(stringType, numberType, booleanType);

        editor.registerNodeType(TestNode, { category: "Tests" });
        editor.registerNodeType(OutputNode, { category: "Outputs" });
        editor.registerNodeType(BuilderTestNode, { category: "Tests" });
        editor.registerNodeType(MathNode);
        editor.registerNodeType(AdvancedNode);
        editor.registerNodeType(CommentNode, { title: "Comment" });
        editor.registerNodeType(InterfaceTestNode);
        editor.registerNodeType(SelectTestNode);
        editor.registerNodeType(SidebarNode);
        editor.graph.addNode(new TestNode());
        editor.graph.addNode(new TestNode());
        editor.graph.addNode(new TestNode());
        editor.graph.addNode(new OutputNode());
        editor.graph.addNode(new BuilderTestNode());
        // editor.addNode(new AdvancedNode());

        const calculate = async () => {
            console.log(await engine.runOnce("def"));
        };

        const save = () => {
            console.log(JSON.stringify(editor.save()));
        };

        const load = () => {
            const s = prompt();
            if (s) {
                editor.load(JSON.parse(s));
            }
        };

        const setSelectItems = () => {
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
        };

        const changeGridSize = () => {
            baklavaView.settings.background.gridSize = Math.round(Math.random() * 100) + 100;
        };

        const createSubgraph = () => {
            baklavaView.commandHandler.executeCommand<Commands.CreateSubgraphCommand>(Commands.CREATE_SUBGRAPH_COMMAND);
        };

        return { baklavaView, calculate, save, load, setSelectItems, changeGridSize, createSubgraph };
    },
});
</script>

<style>
#app {
    margin: 30px 0;
    height: calc(100vh - 60px);
}
</style>
