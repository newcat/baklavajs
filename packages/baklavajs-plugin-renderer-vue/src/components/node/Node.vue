<template>
    <div :id="data.id" :class="['node', { '--selected': selected, '--dragging': dragging }]" :style="styles">

        <div
            class="__title"
            @mousedown.self.prevent.stop="startDrag"
            @contextmenu.self.prevent="openContextMenu"
        >

            <span v-if="!renaming">{{ data.name }}</span>
            <input
                v-else
                type="text"
                class="dark-input"
                v-model="tempName"
                placeholder="Node Name"
                v-click-outside="doneRenaming"
                @keydown.enter="doneRenaming"
            >

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
                    v-if="plugin.sidebar.nodeId === data.id && plugin.sidebar.optionName === name && option.sidebarComponent"
                >
                    <node-option
                        :key="data.id + name"
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
import { Component, Vue, Prop, Inject, Watch } from "vue-property-decorator";
import { VueConstructor } from "vue";

// @ts-ignore
import ClickOutside from "v-click-outside";

import { ViewPlugin, IViewNode } from "../../viewPlugin";
import NodeInterfaceView from "./NodeInterface.vue";
import NodeOptionView from "./NodeOption.vue";
import ContextMenu from "../ContextMenu.vue";

@Component({
    components: {
        "node-interface": NodeInterfaceView,
        ContextMenu,
        "node-option": NodeOptionView
    },
    directives: {
        ClickOutside: ClickOutside.directive
    }
})
export default class NodeView extends Vue {

    @Prop({ type: Object })
    data!: IViewNode;

    @Prop({ type: Boolean, default: false })
    selected!: boolean;

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
        this.data.events.addInterface.addListener(this, () => this.update());
        this.data.events.removeInterface.addListener(this, () => this.update());
        this.data.events.addOption.addListener(this, () => this.update());
        this.data.events.removeOption.addListener(this, () => this.update());
        this.plugin.hooks.renderNode.execute(this);
    }

    updated() {
        this.plugin.hooks.renderNode.execute(this);
    }

    beforeDestroy() {
        this.data.events.addInterface.removeListener(this);
        this.data.events.removeInterface.removeListener(this);
        this.data.events.addOption.removeListener(this);
        this.data.events.removeOption.removeListener(this);
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
        this.plugin.sidebar.nodeId = this.data.id;
        this.plugin.sidebar.optionName = optionName;
        this.plugin.sidebar.visible = true;
    }

}
</script>
