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
import Editor from "@/model/editor";
import TestNode from "@/nodes/TestNode";

@Component({
  components: {
    EditorView
  }
})
export default class App extends Vue {

    editor = new Editor();

    mounted() {
        this.editor.addNode(new TestNode());
        this.editor.addNode(new TestNode());
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

