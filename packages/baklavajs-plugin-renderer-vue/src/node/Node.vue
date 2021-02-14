<template>
    <div :id="node.id" :class="classes" :style="styles">
        <div class="__title" @mousedown.self.stop="startDrag">
            <span v-if="!renaming">{{ node.title }}</span>
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
                <NodeInterface
                    v-for="output in node.outputs"
                    :key="output.id"
                    :node="node"
                    :intf="output"
                ></NodeInterface>
            </div>

            <!-- Inputs -->
            <div class="__inputs">
                <NodeInterface v-for="input in node.inputs" :key="input.id" :node="node" :intf="input"></NodeInterface>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ComponentOptions, inject, ref, computed, onMounted } from "vue";

// TODO: Make custom implementation
// import ClickOutside from "v-click-outside";

import { AbstractNode } from "@baklavajs/core";
import { ViewPlugin } from "../viewPlugin";
import { sanitizeName } from "../utility/cssNames";

import NodeInterface from "./NodeInterface.vue";

export default defineComponent({
    components: { NodeInterface },
    props: {
        node: {
            type: Object as () => AbstractNode,
            required: true,
        },
        selected: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        console.log("NODE", props);
        const plugin = inject<ViewPlugin>("plugin")!;

        const dragging = ref(false);

        const renaming = ref(false);
        const tempName = ref("");

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

        const doneRenaming = () => {
            props.node.title = tempName.value;
            renaming.value = false;
        };

        return { plugin, renaming, tempName, doneRenaming, classes, styles, startDrag, stopDrag, handleMove };
    },
});
</script>
