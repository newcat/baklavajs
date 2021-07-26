<template>
    <div :class="classes" :style="styles" v-show="value" v-click-outside="onClickOutside">
        <template v-for="(item, index) in _items">
            <div v-if="item.isDivider" :key="`divider-${index}`" class="divider"></div>

            <div
                v-else
                :key="`item-${index}`"
                :class="{ 'item': true, 'submenu': !!item.submenu, '--disabled': !!item.disabled }"
                @mouseenter="onMouseEnter($event, index)"
                @mouseleave="onMouseLeave($event, index)"
                @click.stop.prevent="onClick(item)"
                class="d-flex align-items-center"
            >
                <div class="flex-fill">{{ item.label }}</div>
                <div v-if="item.submenu" class="ml-3" style="line-height: 1em">
                    <svg width="13" height="13" viewBox="-60 120 250 250">
                        <path
                            d="M160.875 279.5625 L70.875 369.5625 L70.875 189.5625 L160.875 279.5625 Z"
                            stroke="none"
                            fill="white"
                        />
                    </svg>
                </div>
                <context-menu
                    v-if="item.submenu"
                    :value="activeMenu === index"
                    :items="item.submenu"
                    :is-nested="true"
                    :is-flipped="{ x: flippedX, y: flippedY }"
                    :flippable="flippable"
                    @click="onChildClick"
                ></context-menu>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { Options, Prop, Vue, Watch } from "vue-property-decorator";

// @ts-ignore
import ClickOutside from "v-click-outside";

export interface IMenuItem {
    label?: string;
    value?: any;
    isDivider?: boolean;
    submenu?: IMenuItem[];
    disabled?: boolean;
    disabledFunction?: () => boolean;
}

@Options({
    directives: {
        ClickOutside: ClickOutside.directive,
    },
})
export default class ContextMenu extends Vue {
    activeMenu = -1;
    activeMenuResetTimeout: number | null = null;

    height = 0;
    rootIsFlipped = { x: false, y: false };

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

    @Prop({ type: Object, default: () => ({ x: false, y: false }) })
    isFlipped!: { x: boolean; y: boolean };

    @Prop({ type: Boolean, default: false })
    flippable!: boolean;

    get styles() {
        const s: any = {};
        if (!this.isNested) {
            s.top = (this.flippedY ? this.y - this.height : this.y) + "px";
            s.left = this.x + "px";
        }
        return s;
    }

    get classes() {
        return {
            "dark-context-menu": true,
            "--flipped-x": this.flippedX,
            "--flipped-y": this.flippedY,
            "--nested": this.isNested,
        };
    }

    get _items() {
        return this.items.map((i) => ({ ...i, hover: false }));
    }

    get flippedX() {
        return this.flippable && (this.rootIsFlipped.x || this.isFlipped.x);
    }

    get flippedY() {
        return this.flippable && (this.rootIsFlipped.y || this.isFlipped.y);
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
            this.$options.components["context-menu"] = ContextMenu;
        } else {
            this.$options.components = { "context-menu": ContextMenu };
        }
    }

    @Watch("y")
    @Watch("items")
    updateFlipped() {
        this.height = this.items.length * 30;
        const parentWidth = (this.$parent!.$el as HTMLElement).offsetWidth;
        const parentHeight = (this.$parent!.$el as HTMLElement).offsetHeight;
        this.rootIsFlipped.x = !this.isNested && this.x > parentWidth * 0.75;
        this.rootIsFlipped.y = !this.isNested && this.y + this.height > parentHeight - 20;
    }

    @Watch("value", { immediate: true })
    updateDisabledValues() {
        if (this.value) {
            this.items.forEach((item) => {
                if (item.disabledFunction) {
                    item.disabled = item.disabledFunction();
                }
            });
        }
    }
}
</script>
