<template>
    <div :id="node.id" :class="classes" :style="styles" @mousedown="select">
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
import { defineComponent, ref, computed, toRef } from "vue";

// TODO: Make custom implementation
// import ClickOutside from "v-click-outside";

import { AbstractNode } from "@baklavajs/core";
import { sanitizeName, useDragMove, usePlugin } from "../utility";
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
        const { plugin } = usePlugin();
        const dragMove = useDragMove(toRef(props.node, "position"));

        const renaming = ref(false);
        const tempName = ref("");

        const classes = computed(() => ({
            "node": true,
            "--selected": props.selected,
            "--dragging": dragMove.dragging.value,
            "--two-column": !!props.node.twoColumn,
            [`--type-${sanitizeName(props.node.type)}`]: true,
        }));

        const styles = computed(() => ({
            top: `${props.node.position?.y ?? 0}px`,
            left: `${props.node.position?.x ?? 0}px`,
            width: `${props.node.width ?? 200}px`,
        }));

        const select = () => {
            emit("select", props.node);
        };

        const startDrag = (ev: MouseEvent) => {
            dragMove.onMouseDown(ev);
            document.addEventListener("mousemove", dragMove.onMouseMove);
            document.addEventListener("mouseup", stopDrag);
            select();
        };

        const stopDrag = () => {
            dragMove.onMouseUp();
            document.removeEventListener("mousemove", dragMove.onMouseMove);
            document.removeEventListener("mouseup", stopDrag);
        };

        const doneRenaming = () => {
            props.node.title = tempName.value;
            renaming.value = false;
        };

        return { plugin, renaming, tempName, doneRenaming, classes, styles, select, startDrag };
    },
});
</script>
