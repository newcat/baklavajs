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
import { defineComponent, Ref, ref } from "vue";

import { Editor, Node, NodeInterface } from "../../baklavajs-core/src";
import { ViewPlugin } from "../../baklavajs-plugin-renderer-vue/src";
import { Engine } from "../../baklavajs-plugin-engine/src";
import { InterfaceTypePlugin } from "../../baklavajs-plugin-interface-types/src";

import CustomNodeRenderer from "./CustomNodeRenderer";

import TestNode from "./TestNode";
import OutputNode from "./OutputNode";
import BuilderTestNode from "./BuilderTestNode";
import MathNode from "./MathNode";
import AdvancedNode from "./AdvancedNode";
import CommentNode from "./CommentNode";
import OptionTestNode from "./OptionTestNode";
import SelectTestNode from "./SelectTestNode";

import AddOption from "./AddOption";
import TriggerOption from "./TriggerOption.vue";
import SidebarOption from "./SidebarOption.vue";
import { SelectOption } from "packages/baklavajs-plugin-renderer-vue/src/options";

export default defineComponent({
    setup() {
        const token = Symbol("token");
        const editor = ref(new Editor()) as Ref<Editor>;
        const focusState = ref("blur");
        const counter = ref(1);

        const viewPlugin = new ViewPlugin();
        viewPlugin.components.node = CustomNodeRenderer;
        viewPlugin.enableMinimap = true;
        editor.value.use(viewPlugin);

        const engine = new Engine(true);
        engine.events.calculated.addListener(token, (r) => {
            for (const v of r.values()) {
                console.log(v);
            }
        });
        engine.hooks.gatherCalculationData.tap(token, () => "def");
        editor.value.use(engine);

        const nodeInterfaceTypes = new InterfaceTypePlugin();
        editor.value.use(nodeInterfaceTypes);

        editor.value.registerNodeType("TestNode", TestNode, "Tests");
        editor.value.registerNodeType("OutputNode", OutputNode, "Outputs");
        editor.value.registerNodeType("BuilderTestNode", BuilderTestNode, "Tests");
        editor.value.registerNodeType("MathNode", MathNode);
        editor.value.registerNodeType("AdvancedNode", AdvancedNode);
        editor.value.registerNodeType("CommentNode", CommentNode);
        editor.value.registerNodeType("OptionTestNode", OptionTestNode);
        editor.value.registerNodeType("SelectTestNode", SelectTestNode);
        editor.value.addNode(new TestNode());
        editor.value.addNode(new TestNode());
        editor.value.addNode(new TestNode());
        editor.value.addNode(new OutputNode());
        editor.value.addNode(new BuilderTestNode());
        editor.value.addNode(new AdvancedNode());
        nodeInterfaceTypes
            .addType("string", "#00FF00")
            .addType("number", "red")
            .addType("boolean", "purple")
            .addConversion("string", "number", (v) => parseInt(v, 10))
            .addConversion("number", "string", (v) => (v !== null && v !== undefined && v.toString()) || "0")
            .addConversion("boolean", "string", (v) => (typeof v === "boolean" ? v.toString() : "null"));

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
            for (const node of editor.value.nodes) {
                if (node.type === "SelectTestNode") {
                    const sel = node.inputs["Advanced"] as SelectOption;
                    sel!.items = [
                        { text: "X", value: 1 },
                        { text: node.id, value: 2 },
                    ];
                    sel!.events.updated.emit();
                }
            }
        };

        const changeGridSize = () => {
            this.viewPlugin.backgroundGrid.gridSize = Math.round(Math.random() * 100) + 100;
        };
    },
});

@Component
class App extends Vue {
    async calculate() {
        // console.log(await this.engine.calculate("def"));
    }
}
</script>

<style>
#app {
    margin: 30px 0;
    height: 700px;
}
</style>
