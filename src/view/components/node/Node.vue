<template>
    <div :id="data.id" :class="['node', { '--selected': selected }]" :style="styles">

        <div
            class="__title"
            @mousedown.self.prevent.stop="startDrag"
            @contextmenu.self.prevent="openContextMenu"
        >

            <span v-if="!renaming">{{ data.name }}</span>
            <input-option
                v-else
                v-model="tempName"
                v-click-outside="doneRenaming"
                @keydown.enter="doneRenaming"
            ></input-option>

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
            <template v-for="[name, option] in options">

                <node-option
                    :key="name"
                    :name="name"
                    :option="option"
                    :componentName="option.optionComponent"
                    :node="data"
                    @openSidebar="openSidebar(name)"
                ></node-option>

                <portal :key="'sb_' + name" to="sidebar"
                    v-if="$baklava.sidebar.nodeId === data.id && $baklava.sidebar.optionName === name && option.sidebarComponent"
                >
                    <node-option
                        :name="name"
                        :option="option"
                        :componentName="option.sidebarComponent"
                        :node="data"
                    ></node-option>
                </portal>

            </template>

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
import { Component, Vue, Prop, Inject } from "vue-property-decorator";
import { VueConstructor } from "vue";

// @ts-ignore
import ClickOutside from "v-click-outside";

import { Node, NodeInterface, NodeOption, BaklavaEvent } from "../../../core";
import { ViewPlugin } from "../../viewPlugin";
import NodeInterfaceView from "./NodeInterface.vue";
import NodeOptionView from "./NodeOption.vue";
import ContextMenu from "../ContextMenu.vue";
import InputOption from "../../options/InputOption.vue";
import EditorView from "../Editor.vue";

@Component({
    components: {
        "node-interface": NodeInterfaceView,
        ContextMenu,
        InputOption,
        "node-option": NodeOptionView
    },
    directives: {
        ClickOutside: ClickOutside.directive
    }
})
export default class NodeView extends Vue {

    @Prop({ type: Object })
    data!: Node;

    @Prop({ type: Boolean, default: false })
    selected!: boolean;

    @Inject("editor")
    editor!: EditorView;

    @Inject("plugin")
    plugin!: ViewPlugin;

    dragging = false;
    width = 200;

    renaming = false;
    tempName = "";

    contextMenu = {
        show: false,
        x: 0,
        y: 0,
        items: [
            { value: "rename", label: "Rename" },
            { value: "delete", label: "Delete" }
        ]
    };

    private unsubscribe: (() => void)|null = null;

    get styles() {
        return {
            top: `${this.data.position.y}px`,
            left: `${this.data.position.x}px`,
            width: `${this.width}px`,
        };
    }

    get options() {
        return Array.from(this.data.options.entries());
    }

    mounted() {
        this.unsubscribe = this.data.addListener("*", (ev: BaklavaEvent<any>) => {
            if (!ev.eventType.startsWith("before")) {
                this.$forceUpdate();
            }
        });
    }

    beforeDestroy() {
        if (this.unsubscribe) { this.unsubscribe(); }
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

    openContextMenu(ev: MouseEvent) {
        this.contextMenu.show = true;
        this.contextMenu.x = ev.offsetX;
        this.contextMenu.y = ev.offsetY;
    }

    onContextMenu(action: string) {
        switch (action) {
            case "delete":
                this.plugin.editor.removeNode(this.data);
                break;
            case "rename":
                this.tempName = this.data.name;
                this.renaming = true;
        }
    }

    doneRenaming() {
        this.data.name = this.tempName;
        this.renaming = false;
    }

    openSidebar(optionName: string) {
        this.$baklava.sidebar.nodeId = this.data.id;
        this.$baklava.sidebar.optionName = optionName;
        this.$baklava.sidebar.visible = true;
    }

}
</script>
