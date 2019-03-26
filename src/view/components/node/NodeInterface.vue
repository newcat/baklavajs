<template>
    <div :id="data.id" :class="classes">
        <div class="__port" @mouseover="startHover" @mouseout="endHover"></div>
        <span v-if="data.connectionCount > 0 || !data.option || !getOptionComponent(data.option)" class="align-middle">
            {{ name }}
        </span>
        <component
            v-else
            :is="getOptionComponent(data.option)"
            :value="value"
            @input="data.value = $event"
            :name="name"
        ></component>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from "vue-property-decorator";
import { VueConstructor } from "vue";
import Editor from "../Editor.vue";
import { NodeInterface } from "../../../core";

@Component
export default class NodeInterfaceView extends Vue {

    @Prop({ type: Object, default: () => ({}) })
    data!: NodeInterface;

    @Prop({ type: String, default: "" })
    name!: string;

    @Inject()
    editor!: Editor;

    value: any = null;

    get classes() {
        return {
            "node-interface": true,
            "--input": this.data.isInput,
            "--output": !this.data.isInput
        };
    }

    beforeMount() {
        this.value = this.data.value;
        this.data.events.setValue.addListener(this, (v) => { this.value = v; });
        this.data.events.setConnectionCount.addListener(this, () => { this.$forceUpdate(); });
    }

    beforeDestroy() {
        this.data.events.setValue.removeListener(this);
        this.data.events.setConnectionCount.removeListener(this);
    }

    startHover() {
        this.editor.hoveredOver(this.data);
    }
    endHover() {
        this.editor.hoveredOver(undefined);
    }

    getOptionComponent(name: string) {
        if (!name || !this.editor.options) { return; }
        return this.editor.options[name];
    }

}
</script>
