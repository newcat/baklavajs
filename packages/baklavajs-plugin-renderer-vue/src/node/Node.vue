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
        </div>

        <div class="__content">
            <!-- Outputs -->
            <div class="__outputs">
                <component
                    :is="plugin.components.nodeInterface"
                    v-for="(output, name) in node.outputInterfaces"
                    :key="output.id"
                    :name="name"
                    :data="output"
                ></component>
            </div>

            <!-- Options -->
            <div class="__options">
                <template v-for="[name, option] in node.options">
                    <component
                        :is="plugin.components.nodeOption"
                        :key="name"
                        :name="name"
                        :option="option"
                        :componentName="option.optionComponent"
                        :node="node"
                        @openSidebar="openSidebar(name)"
                    ></component>

                    <portal
                        :key="'sb_' + name"
                        to="sidebar"
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
                    </portal>
                </template>
            </div>

            <!-- Inputs -->
            <div class="__inputs">
                <component
                    :is="plugin.components.nodeInterface"
                    v-for="(input, name) in node.inputInterfaces"
                    :key="input.id"
                    :name="name"
                    :data="input"
                ></component>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ComponentOptions, inject, ref, computed, onMounted } from "vue";

// @ts-ignore
import ClickOutside from "v-click-outside";

import { ViewPlugin } from "../viewPlugin";
import { IViewNode } from "./viewNode";
import { sanitizeName } from "../utility/cssNames";

export default defineComponent({
    directives: {
        ClickOutside: ClickOutside.directive,
    },
    props: {
        node: {
            type: Object as () => IViewNode,
            required: true,
        },
        selected: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const plugin = inject<ViewPlugin>("plugin")!;

        const dragging = ref(false);

        const classes = computed(() => ({
            "node": true,
            "--selected": props.selected,
            "--dragging": dragging.value,
            "--two-column": !!props.node.twoColumn,
            [`--type-${sanitizeName(props.node.type)}`]: true,
        }));

        const styles = computed(() => ({
            top: `${props.node.position.y}px`,
            left: `${props.node.position.x}px`,
            width: `${props.node.width}px`,
        }));

        const startDrag = () => {
            dragging.value = true;
            document.addEventListener("mousemove", handleMove);
            document.addEventListener("mouseup", stopDrag);
            emit("select", props.node);
        };

        const stopDrag = () => {
            dragging.value = false;
            document.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseup", stopDrag);
        };

        const handleMove = (ev: MouseEvent) => {
            if (dragging.value) {
                props.node.position.x += ev.movementX / plugin.scaling;
                props.node.position.y += ev.movementY / plugin.scaling;
            }
        };

        return { classes, styles, startDrag, stopDrag, handleMove };
    },
});
</script>
