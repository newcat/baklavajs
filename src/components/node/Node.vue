<template>
    <div :id="data.id" :class="['node', { '--selected': selected }]" :style="styles">

        <div class="__title" @mousedown.prevent.stop="startDrag">
            {{ data.name }}
        </div>

        <div class="__content">
            
            <!-- Outputs -->
            <node-interface
                v-for="output in outputs"
                :key="output.id"
                :data="output"
            ></node-interface>

            <!-- Options -->
            <!-- TODO
            <node-option
                v-for="(option, key) in (nodedata.Options)"
                :key="key"
                :rname="'Options.' + key"
                :data="option"
            ></node-option>
            -->

            <!-- Inputs -->
            <node-interface
                v-for="input in inputs"
                :key="input.id"
                :data="input"
            ></node-interface>

        </div>

    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import NodeInterface from "./NodeInterface.vue";
import NodeEditor from "../Editor.vue";
import { INode } from "@/types/node";

@Component({
    components: {
        "node-interface": NodeInterface
    }
})
export default class Node extends Vue {

    @Prop({ type: Object })
    data!: INode;

    @Prop({ type: String })
    id!: string;

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
        return this.data.interfaces.filter((i) => !i.isInput);
    }

    get inputs() {
        return this.data.interfaces.filter((i) => i.isInput);
    }

    mounted() {
        this.parent.registerNode(this.id, this);
    }

    beforeDestroy() {
        this.parent.unregisterNode(this.id);
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
            /*this.$emit("input", {
                ...this.data,
                position: {
                    x: this.data.position.x + ev.movementX,
                    y: this.data.position.y + ev.movementY
                }
            });*/
            this.$emit("moved");
            this.data.position.x += ev.movementX;
            this.data.position.y += ev.movementY;
        }
    }

}
</script>
