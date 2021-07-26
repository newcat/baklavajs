<template>
    <div :id="node.id" :style="styles" @mousedown="startDrag">
        <textarea rows="6" cols="20"></textarea>
    </div>
</template>

<script lang="ts">
import { Vue, Prop, Inject } from "vue-property-decorator";

import { ViewPlugin } from "../../baklavajs-plugin-renderer-vue/src";
import { IViewNode } from "../../baklavajs-plugin-renderer-vue/types";

export default class CommentNode extends Vue {

    @Prop({ type: Object })
    node!: IViewNode;

    @Prop({ type: Boolean, default: false })
    selected!: boolean;

    @Inject()
    plugin!: ViewPlugin;

    dragging = false;
    width = 200;

    get styles() {
        return {
            "position": "absolute",
            "top": `${this.node.position.y}px`,
            "left": `${this.node.position.x}px`,
            "width": `${this.width}px`,
            "height": "200px",
            "background-color": "yellow"
        };
    }

    update() {
        this.$forceUpdate();
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
            const scaleFactor = this.plugin.scaling * window.devicePixelRatio;
            this.node.position.x += ev.movementX / scaleFactor;
            this.node.position.y += ev.movementY / scaleFactor;
        }
    }

}
</script>
