<template>
    <div :id="data.id" :class="['node', { '--selected': selected }]" :style="styles">

        <div
            class="__title"
            @mousedown.prevent.stop="startDrag"
            @contextmenu.self.prevent="openContextMenu"
        >
            {{ data.name }}

            <context-menu
                v-model="contextMenu.show"
                :x="contextMenu.x" :y="contextMenu.y"
                :items="contextMenu.items"
                @click="onContextMenu"
            ></context-menu>

        </div>

        <div class="__content">
            
            <!-- Outputs -->
            <node-interface
                v-for="(output, name) in data.outputInterfaces"
                :key="output.id"
                :name="name"
                :data="output"
            ></node-interface>

            <!-- Options -->
            <component
                v-for="(optionView, key) in optionViews"
                :key="key"
                :name="key"
                :is="optionView"
                v-model="data.options[key]"
            ></component>

            <!-- Inputs -->
            <node-interface
                v-for="(input, name) in data.inputInterfaces"
                :key="input.id"
                :name="name"
                :data="input"
            ></node-interface>

        </div>

    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { VueConstructor } from "vue";

import NodeEditor from "../Editor.vue";
import { Node, NodeInterface } from "../../model";
import NodeInterfaceView from "./NodeInterface.vue";
import ContextMenu from "../ContextMenu.vue";

@Component({
    components: {
        "node-interface": NodeInterfaceView,
        ContextMenu
    }
})
export default class NodeView extends Vue {

    @Prop({ type: Object })
    data!: Node;

    @Prop({ type: Boolean, default: false })
    selected!: boolean;

    dragging = false;
    width = 200;

    contextMenu = {
        show: false,
        x: 0,
        y: 0,
        items: [
            { value: "rename", label: "Rename" },
            { value: "delete", label: "Delete" }
        ]
    };

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

    openContextMenu(ev: MouseEvent) {
        this.contextMenu.show = true;
        this.contextMenu.x = ev.offsetX;
        this.contextMenu.y = ev.offsetY;
    }

    onContextMenu(action: string) {
        switch (action) {
            case "delete":
                this.parent.model.removeNode(this.data);
                break;
        }
    }

}
</script>
