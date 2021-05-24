<template>
    <div id="app">
        <baklava-editor :plugin="viewPlugin"></baklava-editor>
        <button @click="calculate">Calculate</button>
        <button @click="save">Save</button>
        <button @click="load">Load</button>
        <button @focus="focusState = 'focus'" @blur="focusState = 'blur'">{{ focusState }}</button>
        <button @click="setSelectItems">Set Select Items</button>
        <button @click="changeGridSize">Change Grid Size</button>
    </div>
</template>

<script lang="ts">
import { defineComponent, isReactive, Ref, ref, shallowRef } from "vue";

import {
    Editor,
    Node,
    NodeInterface,
    NodeInstanceOf,
    AbstractNodeConstructor,
    NodeInterfaceDefinition,
    NodeInterfaceFactory,
} from "@baklavajs/core";
import { ViewPlugin, EditorComponent, SelectInterface, createViewPlugin } from "../src";
import { Engine } from "@baklavajs/plugin-engine";
import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";

import CustomNodeRenderer from "./CustomNodeRenderer";

import TestNode from "./TestNode";
import OutputNode from "./OutputNode";
import BuilderTestNode from "./BuilderTestNode";
import MathNode from "./MathNode";
import AdvancedNode from "./AdvancedNode";
import CommentNode from "./CommentNode";
import InterfaceTestNode from "./InterfaceTestNode";
import SelectTestNode from "./SelectTestNode";

export default defineComponent({
    components: {
        "baklava-editor": EditorComponent,
    },
    setup() {
        const token = Symbol("token");
        const editor = ref(new Editor()) as Ref<Editor>;
        const viewPlugin = ref(createViewPlugin()) as Ref<ViewPlugin>;
        const focusState = ref("blur");
        const counter = ref(1);

        // viewPlugin.value.components.node = CustomNodeRenderer;
        viewPlugin.value.enableMinimap = true;
        editor.value.use(viewPlugin.value);

        console.log("SI", isReactive(viewPlugin.value));

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

        return { viewPlugin, focusState, calculate, save, load, setSelectItems, changeGridSize };
    },
});
</script>

<style>
#app {
    margin: 30px 0;
    height: 700px;
}
</style>

function createViewPlugin(): any { throw new Error("Function not implemented."); }
