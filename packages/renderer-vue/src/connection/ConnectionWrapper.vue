<template>
    <connection-view :x1="d.x1" :y1="d.y1" :x2="d.x2" :y2="d.y2" :state="state" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, onBeforeUnmount, onMounted, nextTick, watch } from "vue";
import type { AbstractNode, Connection } from "@baklavajs/core";
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

        const fromNode = computed(() => graph.value.findNodeById(props.connection.from.nodeId));
        const toNode = computed(() => graph.value.findNodeById(props.connection.to.nodeId));

        // Interfaces can be added, removed, reordered or hidden without the node moving or resizing
        const getInterfaceLayout = (node?: AbstractNode) =>
            node
                ? [...Object.values(node.inputs), ...Object.values(node.outputs)]
                      .map((intf) => `${intf.id}:${intf.hidden}`)
                      .join()
                : "";
        const interfaceLayout = computed(
            () => getInterfaceLayout(fromNode.value) + "|" + getInterfaceLayout(toNode.value),
        );

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

        // flush: "post" so the coordinates are read after the nodes have been re-rendered
        watch([() => fromNode.value?.position, () => toNode.value?.position], () => updateCoords(), {
            deep: true,
            flush: "post",
        });
        watch(interfaceLayout, () => updateCoords(), { flush: "post" });

        return { d, state };
    },
});
</script>
