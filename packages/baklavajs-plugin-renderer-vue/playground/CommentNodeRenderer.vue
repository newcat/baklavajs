<template>
    <div :id="node.id" :style="styles" @mousedown="startDrag">
        <textarea rows="6" cols="20"></textarea>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRef } from "vue";
import { AbstractNode } from "@baklavajs/core";
import { useDragMove } from "../src";

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
        const dragMove = useDragMove(toRef(props.node, "position"));

        const styles = computed(() => ({
            "position": "absolute",
            "top": `${props.node.position.y}px`,
            "left": `${props.node.position.x}px`,
            "width": `${props.node.width}px`,
            "height": "200px",
            "background-color": "yellow",
        }));

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

        const select = () => {
            emit("select", props.node);
        };

        return { startDrag, styles };
    },
});
</script>
