<template>
    <div :id="intf.id" ref="el" class="baklava-node-interface" :class="classes">
        <div v-if="intf.port" class="__port" @mouseover="startHover" @mouseout="endHover" />
        <span v-if="intf.connectionCount > 0 || !intf.component" class="align-middle">
            {{ intf.name }}
        </span>
        <component :is="intf.component" v-else v-model="intf.value" :node="node" :intf="intf" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, onUpdated, ref } from "vue";
import { AbstractNode, NodeInterface } from "@baklavajs/core";
import { usePlugin } from "../utility";

export default defineComponent({
    props: {
        node: {
            type: Object as () => AbstractNode,
            required: true,
        },
        intf: {
            type: Object as () => NodeInterface,
            required: true,
        },
    },
    setup(props) {
        const { plugin } = usePlugin();
        const hoveredOver = inject<(intf: NodeInterface | undefined) => void>("hoveredOver")!;

        const el = ref<HTMLElement | null>(null);

        const isConnected = computed(() => props.intf.connectionCount > 0);
        const classes = computed(() => ({
            "--input": props.intf.isInput,
            "--output": !props.intf.isInput,
            "--connected": isConnected.value,
        }));

        const startHover = () => {
            hoveredOver(props.intf);
        };
        const endHover = () => {
            hoveredOver(undefined);
        };

        const onRender = () => {
            if (el.value) {
                plugin.value.hooks.renderInterface.execute({ intf: props.intf, el: el.value });
            }
        };

        onMounted(onRender);
        onUpdated(onRender);

        return { el, isConnected, classes, startHover, endHover };
    },
});
</script>
