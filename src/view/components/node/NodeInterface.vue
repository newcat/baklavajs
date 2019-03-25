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
import { NodeInterface, IValueEventData } from "../../../core";

@Component
export default class NodeInterfaceView extends Vue {

    @Prop({ type: Object, default: () => ({}) })
    data!: NodeInterface;

    @Prop({ type: String, default: "" })
    name!: string;

    @Inject()
    editor!: Editor;

    value: any = null;
    unsubscribe: any = null;

    get classes() {
        return {
            "node-interface": true,
            "--input": this.data.isInput,
            "--output": !this.data.isInput
        };
    }

    beforeMount() {
        this.value = this.data.value;
        this.unsubscribe = this.data.addListener<IValueEventData>("*", (ev) => {
            if (ev.eventType === "setValue") {
                this.value = ev.data.value;
            } else if (ev.eventType === "setConnectionCount") {
                this.$forceUpdate();
            }
        });
    }

    beforeDestroy() {
        if (this.unsubscribe) { this.unsubscribe(); }
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
