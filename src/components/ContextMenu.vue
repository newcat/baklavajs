<template>
    <div class="dark-context-menu">
        <div class="item">Item 1</div>
        <div class="item">Item 2</div>
        <div class="item">Item 3</div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

// @ts-ignore
import ClickOutside from "v-click-outside";

export interface IMenuItem {
    value: any;
    label: string;
    submenu?: IMenuItem[];
}

@Component({
    directives: {
        ClickOutside
    }
})
export default class ContextMenu extends Vue {

    @Prop({ type: Boolean, default: false })
    value!: boolean;

    @Prop({ type: Array, default: () => [] })
    items!: IMenuItem[];

}
</script>
