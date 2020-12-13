<template>
    <div :id="data.id" :class="classes">
        <div class="__port" @mouseover="startHover" @mouseout="endHover"></div>
        <span v-if="data.connectionCount > 0 || !intf.option || !getOptionComponent(intf.option)" class="align-middle">
            {{ intf.name }}
        </span>
        <component
            v-else
            :is="getOptionComponent(intf.option)"
            :option="intf"
            :value="value"
            @input="intf.value = $event"
        ></component>
    </div>
</template>

<script lang="ts">
import { ComponentOptions, computed, defineComponent, inject } from "vue";
import { NodeInterface } from "@baklavajs/core";
import EditorView from "../Editor.vue";
import { ViewPlugin } from "../viewPlugin";

export default defineComponent({
    props: {
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
