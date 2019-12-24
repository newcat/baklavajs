<template>
    <div :id="data.id" :class="classes">
        <div class="__port" @mouseover="startHover" @mouseout="endHover"></div>
        <span v-if="data.connectionCount > 0 || !data.option || !getOptionComponent(data.option)" class="align-middle">
            {{ displayName }}
        </span>
        <component
            v-else
            :is="getOptionComponent(data.option)"
            :option="data"
            :value="value"
            @input="data.value = $event"
            :name="displayName"
        ></component>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from "vue-property-decorator";
import { VueConstructor } from "vue";
import EditorView from "../Editor.vue";
import { INodeInterface } from "../../../../baklavajs-core/types";
import { ViewPlugin } from "../../viewPlugin";

@Component
export default class NodeInterfaceView extends Vue {

    @Prop({ type: Object, default: () => ({}) })
    data!: INodeInterface;

    @Prop({ type: String, default: "" })
    name!: string;

    @Inject("plugin")
    plugin!: ViewPlugin;

    @Inject("editor")
    editor!: EditorView;

    value: any = null;
    isConnected = false;

    get classes() {
        return {
            "node-interface": true,
            "--input": this.data.isInput,
            "--output": !this.data.isInput,
            "--connected": this.isConnected
        };
    }

    get displayName() {
        return this.data.displayName || this.name;
    }

    beforeMount() {
        this.value = this.data.value;
        this.data.events.setValue.addListener(this, (v) => { this.value = v; });
        this.data.events.setConnectionCount.addListener(this, (c) => {
            this.$forceUpdate();
            this.isConnected = c > 0;
        });
        this.isConnected = this.data.connectionCount > 0;
    }

    mounted() {
        this.plugin.hooks.renderInterface.execute(this);
    }

    updated() {
        this.plugin.hooks.renderInterface.execute(this);
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
        if (!name || !this.plugin.options) { return; }
        return this.plugin.options[name];
    }

}
</script>
