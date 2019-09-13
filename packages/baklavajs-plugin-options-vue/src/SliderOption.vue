<template>
<div class="dark-slider">
    <div class="__slider" style="width: 50%;"></div>
    <div class="__content">
        <div class="__label">{{ name }}</div>
        <div class="__value">{{ (value || 0).toFixed(3) }}</div>
    </div>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { INodeOption } from "../../baklavajs-core/types";

// @ts-ignore
import ClickOutside from "v-click-outside";

@Component({
    directives: {
        ClickOutside: ClickOutside.directive
    }
})
export default class SliderOption extends Vue {

    open = false;

    @Prop({ type: String })
    name!: string;

    @Prop({ type: Number })
    value!: any;

    @Prop({ type: Object })
    option!: INodeOption;

}
</script>
