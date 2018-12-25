<template>
    <div :id="data.id" :class="['node-interface', typeClass, { '--input': data.isInput, '--output': !data.isInput }]">
        <div class="__port" @mouseover="startHover" @mouseout="endHover"></div>
        <span class="align-middle">{{ data.name }}</span>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from "vue-property-decorator";
import Editor from "../Editor.vue";
import NodeInterface from "@/model/nodeInterface";

@Component
export default class NodeInterfaceView extends Vue {

    @Prop({ type: Object, default: () => ({}) })
    data!: NodeInterface;

    @Prop({ type: Boolean, default: false })
    isConnected!: boolean;

    @Inject()
    editor!: Editor;

    get typeClass() {
        return "--iftype-" + this.data.type;
    }

    startHover() {
        this.editor.hoveredOver(this.data);
    }
    endHover() {
        this.editor.hoveredOver(undefined);
    }

}
</script>
