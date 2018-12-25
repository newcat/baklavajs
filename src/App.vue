<template>
    <div id="app">
        <editor-view
            :model="editor"
        ></editor-view>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import EditorView from "./components/Editor.vue";
import { INode } from "@/types/node";
import { IConnection } from "@/types/connection";
import Editor from "@/model/editor";
import TestNode from "@/nodes/TestNode";

@Component({
  components: {
    EditorView
  }
})
export default class App extends Vue {

    nodes: INode[] = [
        { id: "n1", type: "a", position: { x: 5, y: 5 }, name: "MyNode", interfaces: [] },
        { id: "n2", type: "a", position: { x: 45, y: 45 }, name: "MyNode", interfaces: [] }
    ];

    connections: IConnection[] = [];

    editor = new Editor();

    mounted() {
        this.editor.addNode(new TestNode());
    }

}
</script>

<style>
#app {
    margin: 30px 0;
    height: 500px;
}
</style>

