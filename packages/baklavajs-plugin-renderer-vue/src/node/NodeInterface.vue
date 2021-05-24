<template>
    <div :id="intf.id" :class="classes">
        <div v-if="intf.port" class="__port" @mouseover="startHover" @mouseout="endHover"></div>
        <span v-if="intf.connectionCount > 0 || !intf.component" class="align-middle">
            {{ intf.name }}
        </span>
        <component v-else :is="intf.component" v-model="intf.value" :node="node" :intf="intf"></component>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { AbstractNode, NodeInterface } from "@baklavajs/core";

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
        const hoveredOver = inject<(intf: NodeInterface | undefined) => void>("hoveredOver")!;

        const isConnected = computed(() => props.intf.connectionCount > 0);
        const classes = computed(() => ({
            "node-interface": true,
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

        return { isConnected, classes, startHover, endHover };
    },
});
</script>
