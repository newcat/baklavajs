<template>
    <div :id="intf.id" ref="el" class="baklava-node-interface" :class="classes">
        <div
            v-if="intf.port"
            class="__port"
            :class="{ '--selected': temporaryConnection?.from === intf }"
            @pointerover="startHover"
            @pointerout="endHover"
        >
            <span v-if="showTooltip === true" class="__tooltip">
                {{ ellipsis(intf.value) }}
            </span>
        </div>
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

<script setup lang="ts">
import { computed, inject, onMounted, onUpdated, Ref, ref } from "vue";
import { AbstractNode, NodeInterface } from "@baklavajs/core";
import { useViewModel } from "../utility";
import {
    ITemporaryConnectionHandler,
    TEMPORARY_CONNECTION_HANDLER_INJECTION_SYMBOL,
} from "../editor/temporaryConnection";

const ellipsis = (value: any, characters = 100) => {
    const stringValue  = value?.toString ? value.toString() : ''

    if (stringValue.length > characters) {
        return stringValue.slice(0, characters) + "...";
    }

    return stringValue;
};

const props = defineProps<{
    node: AbstractNode;
    intf: NodeInterface;
}>();

const { viewModel } = useViewModel();
const { hoveredOver, temporaryConnection } = inject<ITemporaryConnectionHandler>(
    TEMPORARY_CONNECTION_HANDLER_INJECTION_SYMBOL,
)!;

const el = ref<HTMLElement | null>(null) as Ref<HTMLElement>;

const isConnected = computed(() => props.intf.connectionCount > 0);
const isHovered = ref<boolean>(false);
const showTooltip = computed(() => viewModel.value.settings.displayValueOnHover && isHovered.value);
const classes = computed(() => ({
    "--input": props.intf.isInput,
    "--output": !props.intf.isInput,
    "--connected": isConnected.value,
}));
const showComponent = computed<boolean>(
    () => props.intf.component && (!props.intf.isInput || !props.intf.port || props.intf.connectionCount === 0),
);

const startHover = () => {
    isHovered.value = true;
    hoveredOver(props.intf);
};
const endHover = () => {
    isHovered.value = false;
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
</script>
