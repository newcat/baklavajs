<template>
    <div :id="data.id" :style="styles" @mousedown="startDrag">
        <textarea rows="6" cols="20"></textarea>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject, Watch } from "vue-property-decorator";
import { VueConstructor } from "vue";

// @ts-ignore
import ClickOutside from "v-click-outside";

import { ViewPlugin } from "../../baklavajs-plugin-renderer-vue/src";
import { IViewNode } from "../../baklavajs-plugin-renderer-vue/types";

@Component
export default class CommentNode extends Vue {

    @Prop({ type: Object })
    data!: IViewNode;

    @Prop({ type: Boolean, default: false })
    selected!: boolean;

    @Inject("plugin")
    plugin!: ViewPlugin;

    dragging = false;
    width = 200;

    get styles() {
        return {
            "position": "absolute",
            "top": `${this.data.position.y}px`,
            "left": `${this.data.position.x}px`,
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
            this.data.position.x += ev.movementX / this.plugin.scaling;
            this.data.position.y += ev.movementY / this.plugin.scaling;
        }
    }

}
</script>
