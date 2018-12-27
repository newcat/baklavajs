<template>
    <div :id="data.id" :class="['node', { '--selected': selected }]" :style="styles">

        <div class="__title" @mousedown.prevent.stop="startDrag">
            {{ data.name }}
        </div>

        <div class="__content">
            
            <!-- Outputs -->
            <node-interface
                v-for="(output, name) in outputs"
                :key="output.id"
                :name="name"
                :data="output"
            ></node-interface>

            <!-- Options -->
            <component
                v-for="(optionView, key) in optionViews"
                :key="key"
                :is="optionView"
                v-model="data.options[key]"
            ></component>

            <!-- Inputs -->
            <node-interface
                v-for="(input, name) in inputs"
                :key="input.id"
                :name="name"
                :data="input"
            ></node-interface>

        </div>

    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import _ from "lodash";

import NodeInterface from "./NodeInterface.vue";
import NodeEditor from "../Editor.vue";
import Node from "@/model/node";

@Component({
    components: {
        "node-interface": NodeInterface
    }
})
export default class NodeView extends Vue {

    @Prop({ type: Object })
    data!: Node;

    @Prop({ type: Boolean, default: false })
    selected!: boolean;

    dragging = false;
    width = 200;

    get parent() {
        return this.$parent as NodeEditor;
    }

    get styles() {
        return {
            top: `${this.data.position.y + this.parent.yOffset}px`,
            left: `${this.data.position.x + this.parent.xOffset}px`,
            width: `${this.width}px`,
        };
    }

    get outputs() {
        return _.pickBy(this.data.interfaces, (i) => !i.isInput);
    }

    get inputs() {
        return _.pickBy(this.data.interfaces, (i) => i.isInput);
    }

    get optionViews() {
        return this.data.optionViews;
    }

    startDrag() {
        this.dragging = true;
        document.addEventListener("mousemove", this.handleMove);
        document.addEventListener("mouseup", this.stopDrag);
        this.select();
    }

    select() {
        this.$emit("select", this);
    }

    stopDrag() {
        this.dragging = false;
        document.removeEventListener("mousemove", this.handleMove);
        document.removeEventListener("mouseup", this.stopDrag);
    }

    handleMove(ev: MouseEvent) {
        if (this.dragging) {
            this.data.position.x += ev.movementX;
            this.data.position.y += ev.movementY;
        }
    }

}
</script>
