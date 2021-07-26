<template>
    <div :id="intf.id" :class="classes">
        <div class="__port" @mouseover="startHover" @mouseout="endHover"></div>
        <span v-if="intf.connectionCount > 0 || !intf.option || !getOptionComponent(intf.option)" class="align-middle">
            {{ displayName }}
        </span>
        <component
            v-else
            :is="getOptionComponent(intf.option)"
            :option="intf"
            :value="value"
            @input="intf.value = $event"
            :name="displayName"
        ></component>
    </div>
</template>

<script lang="ts">
import { Vue, Prop, Inject } from "vue-property-decorator";
import EditorView from "../Editor.vue";
import { INodeInterface } from "../../../../baklavajs-core/types";
import { ViewPlugin } from "../../viewPlugin";

export default class NodeInterfaceView extends Vue {

    @Prop({ type: Object, default: () => ({}) })
    intf!: INodeInterface;

    @Prop({ type: String, default: "" })
    name!: string;

    @Inject()
    plugin!: ViewPlugin;

    @Inject()
    editor!: EditorView;

    value: any = null;
    isConnected = false;

    get classes() {
        return {
            "node-interface": true,
            "--input": this.intf.isInput,
            "--output": !this.intf.isInput,
            "--connected": this.isConnected
        };
    }

    get displayName() {
        return this.intf.displayName || this.name;
    }

    beforeMount() {
        this.value = this.intf.value;
        this.intf.events.setValue.addListener(this, (v) => { this.value = v; });
        this.intf.events.setConnectionCount.addListener(this, (c) => {
            this.$forceUpdate();
            this.isConnected = c > 0;
        });
        this.intf.events.updated.addListener(this, (v) => { this.$forceUpdate(); });
        this.isConnected = this.intf.connectionCount > 0;
    }

    mounted() {
        this.plugin.hooks.renderInterface.execute(this);
    }

    updated() {
        this.plugin.hooks.renderInterface.execute(this);
    }

    beforeDestroy() {
        this.intf.events.setValue.removeListener(this);
        this.intf.events.setConnectionCount.removeListener(this);
        this.intf.events.updated.removeListener(this);
    }

    startHover() {
        this.editor.hoveredOver(this.intf);
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
