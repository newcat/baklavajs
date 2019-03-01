<template>
    <div :class="['sidebar', { '--open': $baklava.sidebar.visible }]">
        
        <div class="d-flex align-items-center">
            <button tabindex="-1" class="__close" @click="close">&times;</button>
            <div class="ml-2"><b>{{ nodeName }}</b></div>
        </div>

        <portal-target name="sidebar"></portal-target>

    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import NodeEditor from "./Editor.vue";

@Component
export default class Sidebar extends Vue {

    get parent() {
        return this.$parent as NodeEditor;
    }

    get nodeName() {
        const id = this.$baklava.sidebar.nodeId;
        const n = this.parent.model.nodes.find((x) => x.id === id);
        return n ? n.name : "";
    }

    close() {
        this.$baklava.sidebar.visible = false;
    }

}
</script>

