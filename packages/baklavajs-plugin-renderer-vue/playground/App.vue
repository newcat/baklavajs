<template>
    <div id="app">
        <baklava-editor :plugin="baklavaView">
            <template #node="nodeProps">
                <CustomNodeRenderer :key="nodeProps.node.id" v-bind="nodeProps" />
            </template>
        </baklava-editor>
        <button @click="calculate">
            Calculate
        </button>
        <button @click="save">
            Save
        </button>
        <button @click="load">
            Load
        </button>
        <button @click="setSelectItems">
            Set Select Items
        </button>
        <button @click="changeGridSize">
            Change Grid Size
        </button>
        <button @click="createSubgraph">
            Create Subgraph
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { NodeInstanceOf } from "@baklavajs/core";
import { EditorComponent, SelectInterface, useBaklava, Commands } from "../src";
import { Engine } from "@baklavajs/plugin-engine";
import { BaklavaInterfaceTypes } from "@baklavajs/plugin-interface-types";

import CustomNodeRenderer from "./CustomNodeRenderer";

import TestNode from "./TestNode";
import OutputNode from "./OutputNode";
import BuilderTestNode from "./BuilderTestNode";
import MathNode from "./MathNode";
import AdvancedNode from "./AdvancedNode";
import CommentNode from "./CommentNode";
import InterfaceTestNode from "./InterfaceTestNode";
import SelectTestNode from "./SelectTestNode";

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

        const engine = new Engine(editor.value, true);
        engine.events.calculated.subscribe(token, (r) => {
            for (const v of r.values()) {
                console.log(v);
            }
        });
        engine.hooks.gatherCalculationData.subscribe(token, () => "def");

        const nodeInterfaceTypes = new BaklavaInterfaceTypes(editor.value, baklavaView);
        nodeInterfaceTypes
            .addType(stringType)
            .addType(numberType)
            .addType(booleanType)
            .addConversion(stringType, numberType, (v) => parseInt(v, 10))
            .addConversion(numberType, stringType, (v) => (v !== null && v !== undefined && v.toString()) || "0")
            .addConversion(booleanType, stringType, (v) => (typeof v === "boolean" ? v.toString() : "null"));

        editor.value.registerNodeType(TestNode, { category: "Tests" });
        editor.value.registerNodeType(OutputNode, { category: "Outputs" });
        editor.value.registerNodeType(BuilderTestNode, { category: "Tests" });
        editor.value.registerNodeType(MathNode);
        editor.value.registerNodeType(AdvancedNode);
        editor.value.registerNodeType(CommentNode, { title: "Comment" });
        editor.value.registerNodeType(InterfaceTestNode);
        editor.value.registerNodeType(SelectTestNode);
        editor.value.graph.addNode(new TestNode());
        editor.value.graph.addNode(new TestNode());
        editor.value.graph.addNode(new TestNode());
        editor.value.graph.addNode(new OutputNode());
        editor.value.graph.addNode(new BuilderTestNode());
        // editor.value.addNode(new AdvancedNode());

        const calculate = async () => {
            console.log(await engine.calculate("def"));
        };

        const save = () => {
            console.log(JSON.stringify(editor.value.save()));
        };

        const load = () => {
            const s = prompt();
            if (s) {
                editor.value.load(JSON.parse(s));
            }
        };

        const setSelectItems = () => {
            for (const node of editor.value.graph.nodes) {
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

        return { editor, baklavaView, calculate, save, load, setSelectItems, changeGridSize, createSubgraph };
    },
});
</script>

<style>
#app {
    margin: 30px 0;
    height: 700px;
}
</style>
