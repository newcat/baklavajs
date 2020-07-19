<template>
    <div id="app">
        <baklava-editor
            :plugin="viewPlugin"
        ></baklava-editor>
        <button @click="calculate">Calculate</button>
        <button @click="save">Save</button>
        <button @click="load">Load</button>
        <button @focus="focusState = 'focus'" @blur="focusState = 'blur'">{{ focusState }}</button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { VueConstructor } from "vue";

import { Editor, Node, NodeInterface } from "../../baklavajs-core/src";
import { ViewPlugin } from "../../baklavajs-plugin-renderer-vue/src";
import { Engine } from "../../baklavajs-plugin-engine/src";
import { InterfaceTypePlugin } from "../../baklavajs-plugin-interface-types/src";
import { OptionPlugin } from "../../baklavajs-plugin-options-vue/src";

import CustomNodeRenderer from "./CustomNodeRenderer";

import TestNode from "./TestNode";
import OutputNode from "./OutputNode";
import BuilderTestNode from "./BuilderTestNode";
import MathNode from "./MathNode";
import AdvancedNode from "./AdvancedNode";
import CommentNode from "./CommentNode";
import OptionTestNode from "./OptionTestNode";

import AddOption from "./AddOption";
import TriggerOption from "./TriggerOption.vue";
import SidebarOption from "./SidebarOption.vue";

@Component
export default class App extends Vue {

    editor: Editor;
    viewPlugin: ViewPlugin;
    engine: Engine;
    nodeInterfaceTypes: InterfaceTypePlugin;

    focusState = "blur";

    constructor() {
        super();

        this.editor = new Editor();

        this.viewPlugin = new ViewPlugin();
        this.viewPlugin.components.node = CustomNodeRenderer as any;
        this.editor.use(this.viewPlugin);

        this.engine = new Engine(true);
        this.engine.events.calculated.addListener(this, (r) => {
            for (const v of r.values()) {
                // tslint:disable-next-line:no-console
                console.log(v);
            }
        });
        this.engine.hooks.gatherCalculationData.tap(this, () => "def");
        this.editor.use(this.engine);

        this.nodeInterfaceTypes = new InterfaceTypePlugin();
        this.editor.use(this.nodeInterfaceTypes);

        this.editor.use(new OptionPlugin());

        this.viewPlugin.hooks.renderNode.tap(this, (node) => {
            if (node.data.type === "TestNode") {
                (node.$el as HTMLElement).style.backgroundColor = "red";
            }
            return node;
        });

        this.viewPlugin.registerOption("AddOption", AddOption);
        this.viewPlugin.registerOption("TriggerOption", TriggerOption);
        this.viewPlugin.registerOption("SidebarOption", SidebarOption);

    }

    mounted() {

        this.editor.registerNodeType("TestNode", TestNode, "Tests");
        this.editor.registerNodeType("OutputNode", OutputNode, "Outputs");
        this.editor.registerNodeType("BuilderTestNode", BuilderTestNode, "Tests");
        this.editor.registerNodeType("MathNode", MathNode);
        this.editor.registerNodeType("AdvancedNode", AdvancedNode);
        this.editor.registerNodeType("CommentNode", CommentNode);
        this.editor.registerNodeType("OptionTestNode", OptionTestNode);
        this.editor.addNode(new TestNode());
        this.editor.addNode(new TestNode());
        this.editor.addNode(new TestNode());
        this.editor.addNode(new OutputNode());
        this.editor.addNode(new BuilderTestNode());
        this.editor.addNode(new AdvancedNode());
        this.nodeInterfaceTypes
            .addType("string", "#00FF00")
            .addType("number", "red")
            .addType("boolean", "purple")
            .addConversion("string", "number", (v) => parseInt(v, 10))
            .addConversion("number", "string", (v) => v !== null && v !== undefined && v.toString() || "0")
            .addConversion("boolean", "string", (v) => typeof(v) === "boolean" ? v.toString() : "null");
        this.viewPlugin.setNodeTypeAlias("TestNode", "TestNode (with alias)");
    }

    async calculate() {
        // console.log(await this.engine.calculate("def"));
    }

    save() {
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(this.editor.save()));
    }

    load() {
        const s = prompt();
        if (s) { this.editor.load(JSON.parse(s)); }
    }

}
</script>

<style>
#app {
    margin: 30px 0;
    height: 700px;
}
</style>

