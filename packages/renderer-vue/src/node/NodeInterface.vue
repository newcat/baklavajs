<template>
    <div :id="intf.id" ref="el" class="baklava-node-interface" :class="classes">
        <div v-if="intf.port" class="__port" @pointerover="startHover" @pointerout="endHover" />
        <component
            :is="intf.component"
            v-if="showComponent"
            v-model="intf.value"
            :node="node"
            :intf="intf"
            @open-sidebar="openSidebar"
        />
        <span v-else class="align-middle">
            {{ intf.name }}
        </span>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, onUpdated, Ref, ref } from "vue";
import { AbstractNode, NodeInterface } from "@baklavajs/core";
import { useViewModel } from "../utility";

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
        const { viewModel } = useViewModel();
        const hoveredOver = inject<(intf: NodeInterface | undefined) => void>("hoveredOver")!;

        const el = ref<HTMLElement | null>(null) as Ref<HTMLElement>;

        const isConnected = computed(() => props.intf.connectionCount > 0);
        const classes = computed(() => ({
            "--input": props.intf.isInput,
            "--output": !props.intf.isInput,
            "--connected": isConnected.value,
        }));
        const showComponent = computed<boolean>(
            () => props.intf.component && props.intf.connectionCount === 0 && (props.intf.isInput || !props.intf.port),
        );

        const startHover = () => {
            hoveredOver(props.intf);
        };
        const endHover = () => {
            hoveredOver(undefined);
        };

        const onRender = () => {
            if (el.value) {
                viewModel.value.hooks.renderInterface.execute({ intf: props.intf, el: el.value });
            }
        };

        const openSidebar = () => {
            const sidebar = viewModel.value.displayedGraph.sidebar;
            sidebar.nodeId = props.node.id;
            sidebar.optionName = props.intf.name;
            sidebar.visible = true;
        };

        onMounted(onRender);
        onUpdated(onRender);

        return { el, isConnected, classes, showComponent, startHover, endHover, openSidebar };
    },
});
</script>
