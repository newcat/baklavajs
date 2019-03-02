<template>
    <div id="app">
        <baklava-editor
            :model="editor"
        ></baklava-editor>
        <button @click="calculate">Calculate</button>
        <button @click="save">Save</button>
        <button @click="load">Load</button>

    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Editor } from "../src/model";

import TestNode from "./TestNode";
import OutputNode from "./OutputNode";
import BuilderTestNode from "./BuilderTestNode";
import MathNode from "./MathNode";
import AdvancedNode from "./AdvancedNode";

@Component
export default class App extends Vue {

    editor = new Editor();

    mounted() {
        this.editor.registerNodeType("TestNode", TestNode, "Tests");
        this.editor.registerNodeType("OutputNode", OutputNode, "Outputs");
        this.editor.registerNodeType("BuilderTestNode", BuilderTestNode, "Tests");
        this.editor.registerNodeType("MathNode", MathNode);
        this.editor.registerNodeType("AdvancedNode", AdvancedNode);
        this.editor.addNode(new TestNode());
        this.editor.addNode(new TestNode());
        this.editor.addNode(new TestNode());
        this.editor.addNode(new OutputNode());
        this.editor.addNode(new BuilderTestNode());
        this.editor.nodeInterfaceTypes
            .addType("string", "#00FF00")
            .addType("number", "red")
            .addType("boolean", "purple")
            .addConversion("string", "number", (v) => parseInt(v))
            .addConversion("number", "string", (v) => v !== null && v !== undefined && v.toString() || "0")
            .addConversion("boolean", "string", (v) => typeof(v) === "boolean" ? v.toString() : "null");
    }

    calculate() {
        this.editor.calculate();
    }

    save() {
        console.log(JSON.stringify(this.editor.save()));
    }

    load() {
        this.editor.load(JSON.parse('{"nodes":[{"type":"TestNode","id":"node_1551399780462","name":"TestNode","position":{"x":107,"y":101},"options":{"test":null,"Select":{"selected":"Test1","items":["Test1","Test2","Test3"]},"This is a checkbox":true,"Number":null},"state":{},"interfaces":{"Input":{"id":"ni_1551399780463","value":true},"Output":{"id":"ni_1551399780464","value":true}}},{"type":"OutputNode","id":"node_1551399780468","name":"OutputNode","position":{"x":768,"y":173},"options":{"output":"true, false"},"state":{},"interfaces":{"Input":{"id":"ni_1551399780469","value":"true, false"}}},{"type":"BuilderTestNode","id":"node_1551399780470","name":"BuilderTestNode","position":{"x":473,"y":239},"options":{"Separator":", ","SidebarTest":{"testtext":"any"}},"state":{},"interfaces":{"Input 1":{"id":"ni_1551399780472","value":"true"},"Input 2":{"id":"ni_1551399780473","value":"false"},"Output":{"id":"ni_1551399780474","value":"true, false"}}},{"type":"TestNode","id":"node_1551399803206","name":"TestNode","position":{"x":104,"y":387},"options":{"test":null,"Select":{"selected":"Test1","items":["Test1","Test2","Test3"]},"This is a checkbox":true,"Number":null},"state":{},"interfaces":{"Input":{"id":"ni_1551399803207","value":false},"Output":{"id":"ni_1551399803208","value":false}}}],"connections":[{"id":"1551399806084","from":"ni_1551399780464","to":"ni_1551399780472"},{"id":"1551399807504","from":"ni_1551399803208","to":"ni_1551399780473"},{"id":"1551399809643","from":"ni_1551399780474","to":"ni_1551399780469"}]}'));
    }

}
</script>

<style>
#app {
    margin: 30px 0;
    height: 700px;
}
</style>

