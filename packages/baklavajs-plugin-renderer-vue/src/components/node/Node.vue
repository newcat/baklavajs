<template>
    <div :id="node.id" :class="classes" :style="styles">
        <div class="__title" @mousedown.self.stop="startDrag" @contextmenu.self.prevent="openContextMenu">
            <span v-if="!renaming">{{ node.name }}</span>
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
                    v-for="(output, name) in node.outputInterfaces"
                    :key="output.id"
                    :name="name"
                    :intf="output"
                ></component>
            </div>

            <!-- Options -->
            <div class="__options">
                <template v-for="[name, option] in node.options" :key="name">
                    <component
                        :is="plugin.components.nodeOption"
                        :name="name"
                        :option="option"
                        :componentName="option.optionComponent"
                        :node="node"
                        @openSidebar="openSidebar(name)"
                    ></component>

                    <teleport
                        :key="'sb_' + name"
                        to="#sidebar"
                        v-if="
                            plugin.sidebar.nodeId === node.id &&
                            plugin.sidebar.optionName === name &&
                            option.sidebarComponent
                        "
                    >
                        <component
                            :is="plugin.components.nodeOption"
                            :key="node.id + name"
                            :name="name"
                            :option="option"
                            :componentName="option.sidebarComponent"
                            :node="node"
                        ></component>
                    </teleport>
                </template>
            </div>

            <!-- Inputs -->
            <div class="__inputs">
                <component
                    :is="plugin.components.nodeInterface"
                    v-for="(input, name) in node.inputInterfaces"
                    :key="input.id"
                    :name="name"
                    :intf="input"
                ></component>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, Prop, Inject } from "vue-property-decorator";

// @ts-ignore
import ClickOutside from "v-click-outside";

import { ViewPlugin } from "../../viewPlugin";
import { IViewNode } from "../../../types";
import { sanitizeName } from "../../utility/cssNames";

interface IPosition {
    x: number;
    y: number;
}

@Options({
    directives: {
        ClickOutside: ClickOutside.directive,
    },
})
export default class NodeView extends Vue {
    @Prop({ type: Object })
    node!: IViewNode;

    @Prop({ type: Boolean, default: false })
    selected!: boolean;

    @Inject()
    plugin!: ViewPlugin;

    @Inject()
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
            { value: "delete", label: "Delete" },
        ],
    };

    get classes() {
        return {
            "node": true,
            "--selected": this.selected,
            "--dragging": !!this.draggingStartPoint,
            "--two-column": !!this.node.twoColumn,
            [`--type-${sanitizeName(this.node.type)}`]: true,
            [this.node.customClasses]: true,
        };
    }

    get styles() {
        return {
            top: `${this.node.position.y}px`,
            left: `${this.node.position.x}px`,
            width: `${this.node.width}px`,
        };
    }

    mounted() {
        this.node.events.addInterface.addListener(this, () => this.update());
        this.node.events.removeInterface.addListener(this, () => this.update());
        this.node.events.addOption.addListener(this, () => this.update());
        this.node.events.removeOption.addListener(this, () => this.update());
        this.plugin.hooks.renderNode.execute(this);
    }

    updated() {
        this.plugin.hooks.renderNode.execute(this);
    }

    beforeDestroy() {
        this.node.events.addInterface.removeListener(this);
        this.node.events.removeInterface.removeListener(this);
        this.node.events.addOption.removeListener(this);
        this.node.events.removeOption.removeListener(this);
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

        this.selectedNodeViews.forEach((elem: any) => {
            elem.draggingStartPoint = {
                  x: ev.screenX,
                  y: ev.screenY,
            };
            elem.draggingStartPosition = {
                  x: elem.node.position.x,
                  y: elem.node.position.y,
            };
            document.addEventListener("mousemove", elem.handleMove);
            document.addEventListener("mouseup", elem.stopDrag);
        });
    }

    select() {
        this.$emit("select", this);
    }

    stopDrag() {
        this.selectedNodeViews.forEach((elem: any) => {
            elem.draggingStartPoint = null;
            elem.draggingStartPosition = null;
            document.removeEventListener("mousemove", elem.handleMove);
            document.removeEventListener("mouseup", elem.stopDrag);
        });
    }

    handleMove(ev: MouseEvent) {
        this.selectedNodeViews.forEach((elem: any) => {
            if (elem.draggingStartPoint) {
                const dx = ev.screenX - elem.draggingStartPoint.x;
                const dy = ev.screenY - elem.draggingStartPoint.y;
                elem.node.position.x = elem.draggingStartPosition.x + dx / elem.plugin.scaling;
                elem.node.position.y = elem.draggingStartPosition.y + dy / elem.plugin.scaling;
            }
        });
    }

    openContextMenu(ev: MouseEvent) {
        this.contextMenu.show = true;
        this.contextMenu.x = ev.offsetX;
        this.contextMenu.y = ev.offsetY;
    }

    onContextMenu(action: string) {
        switch (action) {
            case "delete":
                this.plugin.editor.removeNode(this.node);
                break;
            case "rename":
                this.tempName = this.node.name;
                this.renaming = true;
        }
    }

    doneRenaming() {
        this.node.name = this.tempName;
        this.renaming = false;
    }

    openSidebar(optionName: string) {
        this.plugin.sidebar.nodeId = this.node.id;
        this.plugin.sidebar.optionName = optionName;
        this.plugin.sidebar.visible = true;
    }
}
</script>
