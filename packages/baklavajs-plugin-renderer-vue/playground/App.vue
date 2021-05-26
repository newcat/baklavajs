<template>
    <div id="app">
        <baklava-editor :plugin="baklavaView">
            <template v-slot:node="nodeProps">
                <CustomNodeRenderer :key="nodeProps.node.id" v-bind="nodeProps"></CustomNodeRenderer>
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
import { defineComponent, Ref, ref } from "vue";

import { Editor, NodeInstanceOf } from "@baklavajs/core";
import { EditorComponent, SelectInterface, useBaklava } from "../src";
// import { Engine } from "@baklavajs/plugin-engine";
// import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";

import CustomNodeRenderer from "./CustomNodeRenderer";

import TestNode from "./TestNode";
import OutputNode from "./OutputNode";
import BuilderTestNode from "./BuilderTestNode";
import MathNode from "./MathNode";
import AdvancedNode from "./AdvancedNode";
import CommentNode from "./CommentNode";
import InterfaceTestNode from "./InterfaceTestNode";
import SelectTestNode from "./SelectTestNode";
import { CREATE_SUBGRAPH_COMMAND } from "../src/graph/createSubgraph.command";

export default defineComponent({
    components: {
        CustomNodeRenderer,
        "baklava-editor": EditorComponent,
    },
    setup() {
        const token = Symbol("token");
        const editor = ref(new Editor()) as Ref<Editor>;
        const baklavaView = useBaklava(editor);

        baklavaView.settings.enableMinimap = true;

        // viewPlugin.value.components.node = CustomNodeRenderer;

        /*const engine = new Engine(true);
        engine.events.calculated.addListener(token, (r) => {
            for (const v of r.values()) {
                console.log(v);
            }
        });
        engine.hooks.gatherCalculationData.tap(token, () => "def");
        editor.value.use(engine);*/

        /* const nodeInterfaceTypes = new InterfaceTypePlugin();
        editor.value.use(nodeInterfaceTypes); */

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
        /* nodeInterfaceTypes
            .addType("string", "#00FF00")
            .addType("number", "red")
            .addType("boolean", "purple")
            .addConversion("string", "number", (v) => parseInt(v, 10))
            .addConversion("number", "string", (v) => (v !== null && v !== undefined && v.toString()) || "0")
            .addConversion("boolean", "string", (v) => (typeof v === "boolean" ? v.toString() : "null")); */

        const calculate = async () => {
            // console.log(await this.engine.calculate("def"));
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
                    const n = (node as unknown) as NodeInstanceOf<typeof SelectTestNode>;
                    const sel = n.inputs.advanced as SelectInterface<number | undefined>;
                    sel.items = [
                        { text: "X", value: 1 },
                        { text: node.id, value: 2 },
                    ];
                }
            }
        };

        const changeGridSize = () => {
            // TODO: Make this possible again
            // viewPlugin.backgroundGrid.gridSize = Math.round(Math.random() * 100) + 100;
        };

        const createSubgraph = () => {
            baklavaView.commandHandler.executeCommand(CREATE_SUBGRAPH_COMMAND);
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
