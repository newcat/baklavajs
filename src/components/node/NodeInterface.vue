<template>
    <div :class="['node-interface', typeClass, { '--input': data.isInput, '--output': !data.isInput }]">
        <div class="__port" @mouseover="startHover" @mouseout="endHover"></div>
        <span class="align-middle">{{ data.name }}</span>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from "vue-property-decorator";
import Editor from "../Editor.vue";
import { INodeInterface } from "@/types/nodeInterface";

@Component
export default class NodeInterface extends Vue {

    @Prop({ type: Object, default: () => ({}) })
    interface!: INodeInterface;

    @Prop({ type: Boolean, default: false })
    isConnected!: boolean;

    @Inject()
    editor!: Editor;

    get typeClass() {
        return "--iftype-" + this.interface.type;
    }

    startHover() {
        this.editor.hoveredOver(this.interface);
    }
    endHover() {
        this.editor.hoveredOver(undefined);
    }

}
</script>
