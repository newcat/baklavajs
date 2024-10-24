<template>
    <connection-view :x1="d.x1" :y1="d.y1" :x2="d.x2" :y2="d.y2" :state="state" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, onBeforeUnmount, onMounted, nextTick, watch } from "vue";
import { Connection } from "@baklavajs/core";
import ConnectionView from "./ConnectionView.vue";
import { getDomElements, IResolvedDomElements } from "./domResolver";
import { TemporaryConnectionState } from "./connection";
import { useGraph } from "../utility";

export default defineComponent({
    components: {
        "connection-view": ConnectionView,
    },
    props: {
        connection: {
            type: Object as () => Connection,
            required: true,
        },
    },
    setup(props) {
        const { graph } = useGraph();

        let resizeObserver: ResizeObserver;
        const d = ref({ x1: 0, y1: 0, x2: 0, y2: 0 });

        const state = computed(() =>
            props.connection.isInDanger ? TemporaryConnectionState.FORBIDDEN : TemporaryConnectionState.NONE,
        );

        const fromNodePosition = computed(() => graph.value.findNodeById(props.connection.from.nodeId)?.position);
        const toNodePosition = computed(() => graph.value.findNodeById(props.connection.to.nodeId)?.position);

        const getPortCoordinates = (resolved: IResolvedDomElements): [number, number] => {
            if (resolved.node && resolved.interface && resolved.port) {
                return [
                    resolved.node.offsetLeft +
                        resolved.interface.offsetLeft +
                        resolved.port.offsetLeft +
                        resolved.port.clientWidth / 2,
                    resolved.node.offsetTop +
                        resolved.interface.offsetTop +
                        resolved.port.offsetTop +
                        resolved.port.clientHeight / 2,
                ];
            } else {
                return [0, 0];
            }
        };

        const updateCoords = () => {
            const from = getDomElements(props.connection.from);
            const to = getDomElements(props.connection.to);
            if (from.node && to.node) {
                if (!resizeObserver) {
                    resizeObserver = new ResizeObserver(() => {
                        updateCoords();
                    });
                    resizeObserver.observe(from.node);
                    resizeObserver.observe(to.node);
                }
            }
            const [x1, y1] = getPortCoordinates(from);
            const [x2, y2] = getPortCoordinates(to);
            d.value = { x1, y1, x2, y2 };
        };

        onMounted(async () => {
            await nextTick();
            updateCoords();
        });

        onBeforeUnmount(() => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        });

        watch([fromNodePosition, toNodePosition], () => updateCoords(), { deep: true });

        return { d, state };
    },
});
</script>
