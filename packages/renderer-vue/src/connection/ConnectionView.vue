<template>
    <path class="baklava-connection" :class="classes" :d="d" />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { TemporaryConnectionState } from "./connection";
import { useGraph, useViewModel } from "../utility";

export default defineComponent({
    props: {
        x1: {
            type: Number,
            required: true,
        },
        y1: {
            type: Number,
            required: true,
        },
        x2: {
            type: Number,
            required: true,
        },
        y2: {
            type: Number,
            required: true,
        },
        state: {
            type: Number as () => TemporaryConnectionState,
            default: TemporaryConnectionState.NONE,
        },
        isTemporary: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const { viewModel } = useViewModel();
        const { graph } = useGraph();

        const transform = (x: number, y: number) => {
            const tx = (x + graph.value.panning.x) * graph.value.scaling;
            const ty = (y + graph.value.panning.y) * graph.value.scaling;
            return [tx, ty];
        };

        const d = computed(() => {
            const [tx1, ty1] = transform(props.x1, props.y1);
            const [tx2, ty2] = transform(props.x2, props.y2);
            if (viewModel.value.settings.useStraightConnections) {
                return `M ${tx1} ${ty1} L ${tx2} ${ty2}`;
            } else {
                const dx = 0.3 * Math.abs(tx1 - tx2);
                return `M ${tx1} ${ty1} C ${tx1 + dx} ${ty1}, ${tx2 - dx} ${ty2}, ${tx2} ${ty2}`;
            }
        });

        const classes = computed(() => ({
            "--temporary": props.isTemporary,
            "--allowed": props.state === TemporaryConnectionState.ALLOWED,
            "--forbidden": props.state === TemporaryConnectionState.FORBIDDEN,
        }));

        return { d, classes };
    },
});
</script>
