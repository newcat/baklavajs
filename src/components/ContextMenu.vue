<template>
    <div
        class="dark-context-menu"
        :style="styles"
        v-show="value"
        v-click-outside="onClickOutside"
    >
        <template v-for="(item, index) in _items">

            <div v-if="item.isDivider" :key="index" class="divider"></div>

            <div
                v-else
                :key="index"
                :class="{ 'item': true, 'submenu': !!item.submenu }"
                @mouseenter="activeMenu = index"
                @mouseleave="activeMenu = -1"
                @click.stop.prevent="onClick(item)"
                class="d-flex align-items-center"
            >
                <div class="flex-fill">{{ item.label }}</div>
                <div v-if="item.submenu" class="ml-3" style="line-height:1em;">&#9205;</div>
                <context-menu
                    v-if="item.submenu"
                    :value="activeMenu === index"
                    :items="item.submenu"
                    :is-nested="true"
                    @click="onChildClick"
                ></context-menu>
            </div>

        </template>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

// @ts-ignore
import ClickOutside from "v-click-outside";

export interface IMenuItem {
    label: string;
    value?: any;
    isDivider?: boolean;
    submenu?: IMenuItem[];
}

@Component({
    directives: {
        ClickOutside: ClickOutside.directive
    }
})
export default class ContextMenu extends Vue {

    activeMenu = -1;

    @Prop({ type: Boolean, default: false })
    value!: boolean;

    @Prop({ type: Array, default: () => [] })
    items!: IMenuItem[];

    @Prop({ type: Number, default: 0 })
    x!: number;

    @Prop({ type: Number, default: 0 })
    y!: number;

    @Prop({ type: Boolean, default: false })
    isNested!: boolean;

    get styles() {
        const s: any = {};
        if (!this.isNested) {
            s.top = this.y + "px";
            s.left = this.x + "px";
        }
        return s;
    }

    get _items() {
        return this.items.map((i) => ({ ...i, hover: false }));
    }

    onClick(item: IMenuItem) {
        if (!item.submenu && item.value) {
            this.$emit("click", item.value);
            this.$emit("input", false);
        }
    }

    onChildClick(value: string) {
        this.$emit("click", value);
        this.activeMenu = -1;
        if (!this.isNested) {
            this.$emit("input", false);
        }
    }

    onClickOutside(event: MouseEvent) {
        if (this.value) {
            this.$emit("input", false);
        }
    }

}
</script>
