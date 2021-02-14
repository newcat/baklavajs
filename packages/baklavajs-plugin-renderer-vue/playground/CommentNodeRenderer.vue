<template>
    <div :id="node.id" :style="styles" @mousedown="startDrag">
        <textarea rows="6" cols="20"></textarea>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref } from "vue";
import { AbstractNode } from "@baklavajs/core";
import { ViewPlugin } from "../src";

export default defineComponent({
    props: {
        node: {
            type: Object as () => AbstractNode,
            required: true,
        },
        selected: {
            type: Boolean,
            required: true,
        },
    },
    setup(props, { emit }) {
        const plugin = inject<ViewPlugin>("plugin")!;
        const dragging = ref(false);

        const styles = computed(() => ({
            "position": "absolute",
            "top": `${props.node.position.y}px`,
            "left": `${props.node.position.x}px`,
            "width": `${props.node.width}px`,
            "height": "200px",
            "background-color": "yellow",
        }));

        const startDrag = () => {
            dragging.value = true;
            document.addEventListener("mousemove", handleMove);
            document.addEventListener("mouseup", stopDrag);
            select();
        };

        const select = () => {
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

        return { startDrag, styles };
    },
});
</script>
