<template>
    <div :id="data.id" :class="classes" :style="styles">
        <div class="__title" @mousedown.self.stop="startDrag" @contextmenu.self.prevent="openContextMenu">
            <span v-if="!renaming">{{ data.name }}</span>
            <input
                v-else
                type="text"
                class="dark-input"
                v-model="tempName"
                placeholder="Node Name"
                v-click-outside="doneRenaming"
                @keydown.enter="doneRenaming"
            />

            <component
                :is="plugin.components.contextMenu"
                v-model="contextMenu.show"
                :x="contextMenu.x"
                :y="contextMenu.y"
                :items="contextMenu.items"
                @click="onContextMenu"
            ></component>
        </div>

        <div class="__content">
            <!-- Outputs -->
            <div class="__outputs">
                <component
                    :is="plugin.components.nodeInterface"
                    v-for="(output, name) in data.outputInterfaces"
                    :key="output.id"
                    :name="name"
                    :data="output"
                ></component>
            </div>

            <!-- Options -->
            <div class="__options">
                <template v-for="[name, option] in data.options">
                    <component
                        :is="plugin.components.nodeOption"
                        :key="name"
                        :name="name"
                        :option="option"
                        :componentName="option.optionComponent"
                        :node="data"
                        @openSidebar="openSidebar(name)"
                    ></component>

                    <portal
                        :key="'sb_' + name"
                        to="sidebar"
                        v-if="
                            plugin.sidebar.nodeId === data.id &&
                                plugin.sidebar.optionName === name &&
                                option.sidebarComponent
                        "
                    >
                        <component
                            :is="plugin.components.nodeOption"
                            :key="data.id + name"
                            :name="name"
                            :option="option"
                            :componentName="option.sidebarComponent"
                            :node="data"
                        ></component>
                    </portal>
                </template>
            </div>

            <!-- Inputs -->
            <div class="__inputs">
                <component
                    :is="plugin.components.nodeInterface"
                    v-for="(input, name) in data.inputInterfaces"
                    :key="input.id"
                    :name="name"
                    :data="input"
                ></component>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from "vue-property-decorator";

// @ts-ignore
import ClickOutside from "v-click-outside";

import { ViewPlugin } from "../../viewPlugin";
import { IViewNode } from "../../../types";
import { sanitizeName } from "../../utility/cssNames";

interface IPosition {
    x: number;
    y: number;
}

@Component({
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

    @Inject("selectedNodeViews")
    selectedNodeViews!: NodeView[];

    draggingStartPosition: IPosition | null = null;
    draggingStartPoint: IPosition | null = null;
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

    get classes() {
        return {
            "node": true,
            "--selected": this.selected,
            "--dragging": !!this.draggingStartPoint,
            "--two-column": !!this.data.twoColumn,
            [`--type-${sanitizeName(this.data.type)}`]: true,
            [this.data.customClasses]: true
        };
    }

    get styles() {
        return {
            top: `${this.data.position.y}px`,
            left: `${this.data.position.x}px`,
            width: `${this.data.width}px`
        };
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

    startDrag(ev: MouseEvent) {
        this.select();

        if (this.selectedNodeViews.length === 0 || this.selectedNodeViews[0] === undefined) {
            this.selectedNodeViews.splice(0, this.selectedNodeViews.length);
            this.selectedNodeViews.push(this);
        }

        this.selectedNodeViews.forEach((elem) => {
            elem.draggingStartPoint = {
                x: ev.clientX,
                y: ev.clientY
            };
            elem.draggingStartPosition = {
                x: elem.data.position.x,
                y: elem.data.position.y
            };
            document.addEventListener("mousemove", elem.handleMove);
            document.addEventListener("mouseup", elem.stopDrag);
        });
    }

    select() {
        this.$emit("select", this);
    }

    stopDrag() {
        this.selectedNodeViews.forEach((elem) => {
            elem.draggingStartPoint = null;
            elem.draggingStartPosition = null;
            document.removeEventListener("mousemove", elem.handleMove);
            document.removeEventListener("mouseup", elem.stopDrag);
        });
    }

    handleMove(ev: MouseEvent) {
        if (this.draggingStartPoint) {
            const dx = ev.clientX - this.draggingStartPoint.x;
            const dy = ev.clientY - this.draggingStartPoint.y;
            const { x: newX, y: newY } = this.plugin.snappingProvider(
                this.draggingStartPosition!.x + dx / this.plugin.scaling,
                this.draggingStartPosition!.y + dy / this.plugin.scaling
            );

            const eventData = {
                nodeView: this,
                newPosition: { x: newX, y: newY }
            };
            if (this.plugin.events.beforeNodeMove.emit(eventData)) {
                return;
            }
            this.data.position.x = newX;
            this.data.position.y = newY;
            this.plugin.events.nodeMove.emit(eventData);
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
