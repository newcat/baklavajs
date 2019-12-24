<template>
    <component
        :is="component"
        :name="displayName"
        class="node-option"
        :node="node"
        :value="value"
        :option="option"
        @input="updateValue"
        @openSidebar="$emit('openSidebar')"
    ></component>
</template>

<script lang="ts">
import { CreateElement, VueConstructor } from "vue";
import { Component, Prop, Vue, Inject } from "vue-property-decorator";
import { INodeOption, INode } from "../../../../baklavajs-core/types";
import { ViewPlugin } from "../../viewPlugin";

@Component
export default class NodeOptionView extends Vue {

    @Prop()
    name!: string;

    @Prop()
    option!: INodeOption;

    @Prop()
    componentName!: string;

    @Prop()
    node!: INode;

    @Inject("plugin")
    plugin!: ViewPlugin;

    value: any = null;

    get component() {
        if (!this.plugin.options || !this.componentName) { return; }
        return this.plugin.options[this.componentName];
    }

    get displayName() {
        return this.option.displayName || this.name;
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
