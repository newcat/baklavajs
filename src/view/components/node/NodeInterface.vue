<template>
    <div :id="data.id" :class="classes">
        <div class="__port" :style="portStyle" @mouseover="startHover" @mouseout="endHover"></div>
        <span v-if="data.connectionCount > 0 || !data.option || !getOptionComponent(data.option)" class="align-middle">
            {{ name }}
        </span>
        <component
            :is="getOptionComponent(data.option)"
            :value="data.value"
            @input="data.value = $event"
            :name="name"
        ></component>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from "vue-property-decorator";
import { VueConstructor } from "vue";
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

    getOptionComponent(name: string) {
        if (!name || !this.editor.options) { return; }
        return this.editor.options[name];
    }

}
</script>
