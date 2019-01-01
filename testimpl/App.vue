<template>
    <div id="app">
        <baklava-editor
            :model="editor"
        ></baklava-editor>
        <button @click="calculate">Calculate</button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Editor } from "../src/model";

import TestNode from "./TestNode";
import OutputNode from "./OutputNode";

@Component
export default class App extends Vue {

    editor = new Editor();

    mounted() {
        this.editor.addNode(new TestNode());
        this.editor.addNode(new TestNode());
        this.editor.addNode(new TestNode());
        this.editor.addNode(new OutputNode());
    }

    calculate() {
        this.editor.calculate();
    }

}
</script>

<style>
#app {
    margin: 30px 0;
    height: 500px;
}
</style>

