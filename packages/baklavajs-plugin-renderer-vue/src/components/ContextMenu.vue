<template>
    <div
        :class="{ 'dark-context-menu': true, '--flipped': flipped, '--nested': isNested }"
        :style="styles"
        v-show="value"
        v-click-outside="onClickOutside"
    >
        <template v-for="(item, index) in _items">

            <div v-if="item.isDivider" :key="index" class="divider"></div>

            <div
                v-else
                :key="index"
                :class="{ 'item': true, 'submenu': !!item.submenu, '--disabled': !!item.disabled }"
                @mouseenter="onMouseEnter($event, index)"
                @mouseleave="onMouseLeave($event, index)"
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
                    :is-flipped="flipped"
                    @click="onChildClick"
                ></context-menu>
            </div>

        </template>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

// @ts-ignore
import ClickOutside from "v-click-outside";

export interface IMenuItem {
    label?: string;
    value?: any;
    isDivider?: boolean;
    submenu?: IMenuItem[];
    disabled?: boolean;
    disabledFunction?: (() => boolean);
}

@Component({
    directives: {
        ClickOutside: ClickOutside.directive
    }
})
export default class ContextMenu extends Vue {

    activeMenu = -1;
    activeMenuResetTimeout: number|null = null;
    height = 0;
    rootIsFlipped = false;

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

    @Prop({ type: Boolean, default: false })
    isFlipped!: boolean;

    get styles() {
        const s: any = {};
        if (!this.isNested) {
            s.top = (this.flipped ? this.y - this.height : this.y) + "px";
            s.left = this.x + "px";
        }
        return s;
    }

    get _items() {
        return this.items.map((i) => ({ ...i, hover: false }));
    }

    get flipped() {
        return this.rootIsFlipped || this.isFlipped;
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

    onMouseEnter(event: MouseEvent, index: number) {
        if (this.items[index].submenu) {
            this.activeMenu = index;

            if (this.activeMenuResetTimeout !== null) {
                clearTimeout(this.activeMenuResetTimeout);
                this.activeMenuResetTimeout = null;
            }
        }
    }

    onMouseLeave(event: MouseEvent, index: number) {
        if (this.items[index].submenu) {
            this.activeMenuResetTimeout = window.setTimeout(() => {
                this.activeMenu = -1;
                this.activeMenuResetTimeout = null;
            }, 200);
        }
    }

    created() {
        if (this.$options.components) {
            this.$options.components["context-menu"] = Vue.extend(ContextMenu);
        } else {
            this.$options.components = { "context-menu": Vue.extend(ContextMenu) };
        }
    }

    @Watch("y")
    @Watch("items")
    updateFlipped() {
        this.height = this.items.length * 30;
        const parentHeight = (this.$parent.$el as HTMLElement).offsetHeight;
        this.rootIsFlipped = !this.isNested && this.y + this.height > parentHeight - 20;
    }

    @Watch("value", { immediate: true })
    updateDisabledValues() {
        if (this.value) {
            this.items.forEach((item) => {
                if (item.disabledFunction) {
                    this.$set(item, "disabled", item.disabledFunction());
                }
            });
        }
    }

}
</script>
