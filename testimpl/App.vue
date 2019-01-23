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

@Component
export default class App extends Vue {

    editor = new Editor();

    mounted() {
        this.editor.registerNodeType("TestNode", TestNode, "Tests");
        this.editor.registerNodeType("OutputNode", OutputNode, "Outputs");
        this.editor.registerNodeType("BuilderTestNode", BuilderTestNode, "Tests");
        this.editor.addNode(new TestNode());
        this.editor.addNode(new TestNode());
        this.editor.addNode(new TestNode());
        this.editor.addNode(new OutputNode());
        this.editor.addNode(new BuilderTestNode());
    }

    calculate() {
        this.editor.calculate();
    }

    save() {
        console.log(JSON.stringify(this.editor.save()));
    }

    load() {
        this.editor.load(JSON.parse('{"nodes":[{"type":"TestNode","id":"node_1546630151806","name":"TestNode","position":{"x":16,"y":16},"options":{"Select one":{"selected":"Test1","items":["Test1","Test2","Test3"]}},"state":{},"interfaces":{"InputIF":{"id":"ni_1546630151807"},"OutputIF":{"id":"ni_1546630151808"}}},{"type":"TestNode","id":"node_1546630151810","name":"TestNode","position":{"x":166,"y":208},"options":{"Select one":{"selected":"Test1","items":["Test1","Test2","Test3"]}},"state":{},"interfaces":{"InputIF":{"id":"ni_1546630151811","value":"asdfasdf"},"OutputIF":{"id":"ni_1546630151812","value":"asdfasdf"}}},{"type":"TestNode","id":"node_1546630151813","name":"TestNode","position":{"x":479,"y":69},"options":{"Select one":{"selected":"Test3","items":["Test1","Test2","Test3"]},"test":"4444444"},"state":{},"interfaces":{"InputIF":{"id":"ni_1546630151814","value":"asdfasdf"},"OutputIF":{"id":"ni_1546630151815","value":"asdfasdf"}}},{"type":"OutputNode","id":"node_1546630151816","name":"OutputNode","position":{"x":704,"y":58},"options":{"output":"asdfasdf"},"state":{},"interfaces":{"InputIF":{"id":"ni_1546630151817","value":"asdfasdf"}}}],"connections":[{"id":"1546630996055","from":"ni_1546630151815","to":"ni_1546630151817"},{"id":"1546630996057","from":"ni_1546630151812","to":"ni_1546630151814"}]}'));
    }

}
</script>

<style>
#app {
    margin: 30px 0;
    height: 500px;
}
</style>

