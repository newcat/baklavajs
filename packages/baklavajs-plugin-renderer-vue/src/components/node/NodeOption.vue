<template>
    <component
        :is="component"
        :name="name"
        :node="node"
        :value="value"
        @input="updateValue"
        @openSidebar="$emit('openSidebar')"
    ></component>
</template>

<script lang="ts">
import { CreateElement, VueConstructor } from "vue";
import { Component, Prop, Vue, Inject } from "vue-property-decorator";
import { NodeOption, Node } from "@baklavajs/core";
import { ViewPlugin } from "../../viewPlugin";

@Component
export default class NodeOptionView extends Vue {

    @Prop()
    name!: string;

    @Prop()
    option!: NodeOption;

    @Prop()
    componentName!: string;

    @Prop()
    node!: Node;

    @Inject("plugin")
    plugin!: ViewPlugin;

    value: any = null;

    get component() {
        if (!this.plugin.options || !this.componentName) { return; }
        return this.plugin.options[this.componentName];
    }

    beforeMount() {
        this.value = this.option.value;
        this.option.events.setValue.addListener(this, (v) => { this.value = v; });
    }

    mounted() {
        this.plugin.hooks.renderOption.execute(this);
    }

    updated() {
        this.plugin.hooks.renderOption.execute(this);
    }

    beforeDestroy() {
        this.option.events.setValue.removeListener(this);
    }

    updateValue(v: any) {
        this.option.value = v;
    }

}
</script>
