<template>
    <div :id="data.id" :class="classes">
        <div class="__port" :style="portStyle" @mouseover="startHover" @mouseout="endHover"></div>
        <span v-show="data.connectionCount > 0 || !data.option" class="align-middle">{{ name }}</span>
        <component
            v-show="data.connectionCount === 0 && data.option"
            :is="data.option"
            :value="data.value"
            @input="data.value = $event"
            :name="name"
        ></component>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from "vue-property-decorator";
import Editor from "../Editor.vue";
import { NodeInterface } from "../../../core";

@Component
export default class NodeInterfaceView extends Vue {

    @Prop({ type: Object, default: () => ({}) })
    data!: NodeInterface;

    @Prop({ type: String, default: "" })
    name!: string;

    @Inject()
    editor!: Editor;

    get classes() {
        return {
            "node-interface": true,
            "--input": this.data.isInput,
            "--output": !this.data.isInput
        };
    }

    get portStyle() {
        const type = this.editor.model.nodeInterfaceTypes.types[this.data.type];
        if (type) {
            return { "background-color": type.color };
        } else {
            return {};
        }
    }

    startHover() {
        this.editor.hoveredOver(this.data);
    }
    endHover() {
        this.editor.hoveredOver(undefined);
    }

}
</script>
