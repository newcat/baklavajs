<template>
    <div :class="['sidebar', { '--open': $baklava.sidebar.visible }]" :style="styles">
        
        <div class="__resizer" @mousedown="startResize"></div>

        <div class="d-flex align-items-center">
            <button tabindex="-1" class="__close" @click="close">&times;</button>
            <div class="ml-2"><b>{{ nodeName }}</b></div>
        </div>

        <portal-target name="sidebar"></portal-target>

    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from "vue-property-decorator";
import { ViewPlugin } from "../viewPlugin";

@Component
export default class Sidebar extends Vue {

    width = 300;

    @Inject("plugin")
    plugin!: ViewPlugin;

    get nodeName() {
        const id = this.$baklava.sidebar.nodeId;
        const n = this.plugin.editor.nodes.find((x) => x.id === id);
        return n ? n.name : "";
    }

    get styles() {
        return {
            width: this.width + "px"
        };
    }

    close() {
        this.$baklava.sidebar.visible = false;
    }

    startResize() {
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", () => {
            window.removeEventListener("mousemove", this.onMouseMove);
        }, { once: true });
    }

    onMouseMove(event: MouseEvent) {
        const maxwidth = this.$parent.$el.getBoundingClientRect().width;
        this.width -= event.movementX;
        if (this.width < 300) {
            this.width = 300;
        } else if (this.width > 0.9 * maxwidth) {
            this.width = 0.9 * maxwidth;
        }
    }

}
</script>

