<template>
    <div id="app">
        <editor
            :nodes.sync="nodes"
            :connections.sync="connections"
        ></editor>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Editor from './components/Editor.vue';
import { INode } from '@/types/node';
import { IConnection } from '@/types/connection';

@Component({
  components: {
    Editor
  }
})
export default class App extends Vue {

    nodes: INode[] = [
        { id: "n1", type: "a", position: { x: 5, y: 5 }, name: "MyNode", interfaces: [] },
        { id: "n2", type: "a", position: { x: 45, y: 45 }, name: "MyNode", interfaces: [] }
    ];

    connections: IConnection[] = [];

}
</script>

<style>
#app {
    margin: 30px 0;
    height: 500px;
}
</style>

