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
import { NodeOption, Node, IValueEventData } from "../../../core";
import EditorView from "../Editor.vue";

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

    @Inject("editor")
    editor!: EditorView;

    value: any = null;
    unregister: any;

    get component() {
        if (!this.editor.options || !this.componentName) { return; }
        return this.editor.options[this.componentName];
    }

    beforeMount() {
        this.value = this.option.value;
        this.unregister = this.option.addListener<IValueEventData>("setValue", (ev) => {
            this.value = ev.data.value;
        });
    }

    beforeDestroy() {
        if (this.unregister) { this.unregister(); }
    }

    updateValue(v: any) {
        this.option.value = v;
    }

}
</script>
