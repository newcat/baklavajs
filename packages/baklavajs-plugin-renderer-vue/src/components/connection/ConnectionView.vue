<template>
    <path :d="d" :class="classes"></path>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from "vue-property-decorator";
import { TemporaryConnectionState } from "../../../../baklavajs-core/types";
import { ViewPlugin } from "../../viewPlugin";

@Component
export default class Connection extends Vue {

    @Prop({ type: Number })
    x1!: number;
    @Prop({ type: Number })
    y1!: number;

    @Prop({ type: Number })
    x2!: number;
    @Prop({ type: Number })
    y2!: number;

    @Prop({ type: Number, default: TemporaryConnectionState.NONE })
    state!: TemporaryConnectionState;

    @Prop({ type: Boolean, default: false })
    isTemporary!: boolean;

    @Inject("plugin")
    plugin!: ViewPlugin;

    mounted() {
        this.plugin.hooks.renderConnection.execute(this);
    }

    updated() {
        this.plugin.hooks.renderConnection.execute(this);
    }

    get d() {
        const [tx1, ty1] = this.transform(this.x1, this.y1);
        const [tx2, ty2] = this.transform(this.x2, this.y2);
        const dx = 0.3 * Math.abs(tx1 - tx2);
        return `M ${tx1} ${ty1} C ${tx1 + dx} ${ty1}, ${tx2 - dx} ${ty2}, ${tx2} ${ty2}`;
    }

    get classes() {
        return {
            "connection": true,
            "--temporary": this.isTemporary,
            "--allowed": this.state === TemporaryConnectionState.ALLOWED,
            "--forbidden": this.state === TemporaryConnectionState.FORBIDDEN
        };
    }

    transform(x: number, y: number) {
        const tx = (x + this.plugin.panning.x) * this.plugin.scaling;
        const ty = (y + this.plugin.panning.y) * this.plugin.scaling;
        return [tx, ty];
    }

}
</script>
