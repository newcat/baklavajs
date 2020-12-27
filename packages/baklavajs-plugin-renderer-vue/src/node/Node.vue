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
                @keydown.enter="doneRenaming"
            />
        </div>

        <div class="__content">
            <!-- Outputs -->
            <div class="__outputs">
                <component
                    :is="plugin.components.nodeInterface"
                    v-for="output in node.outputInterfaces"
                    :key="output.id"
                    :node="node"
                    :intf="output"
                ></component>
            </div>

            <!-- Inputs -->
            <div class="__inputs">
                <component
                    :is="plugin.components.nodeInterface"
                    v-for="input in node.inputInterfaces"
                    :key="input.id"
                    :node="node"
                    :intf="input"
                ></component>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ComponentOptions, inject, ref, computed, onMounted } from "vue";

// TODO: Make custom implementation
// import ClickOutside from "v-click-outside";

import { ViewPlugin } from "../viewPlugin";
import { IViewNode } from "./viewNode";
import { sanitizeName } from "../utility/cssNames";

export default defineComponent({
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
