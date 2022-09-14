<template>
<div
    :class="['dark-select', { '--open': open }]"
    @click="open = !open"
    v-click-outside="() => { open = false; }"
>
    <div class="__selected">
        <div class="__text">{{ selectedText }}</div>
        <div class="__icon">
            <i-arrow></i-arrow>
        </div>
    </div>
    <transition name="slide-fade">
        <div class="__dropdown" v-show="open">
            <div class="item --header">{{ name }}</div>
            <div
                v-for="(item, i) in items"
                :key="i"
                :class="['item', { '--active': isSelected(item) }]"
                @click="setSelected(item)"
            >{{ isAdvancedMode ? item.text : item }}</div>
        </div>
    </transition>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Arrow from "./Arrow.vue";
import { INodeOption, INodeInterface } from "../../baklavajs-core/types";

// @ts-ignore
import ClickOutside from "v-click-outside";

interface IAdvancedItem {
    text: string;
    value: any;
}
type ItemType = string|IAdvancedItem;

@Component({
    components: {
        "i-arrow": Arrow
    },
    directives: {
        ClickOutside: ClickOutside.directive
    }
})
export default class SelectOption extends Vue {

    open = false;
    items: ItemType[] = [];

    @Prop({ type: String })
    name!: string;

    @Prop()
    value!: any;

    @Prop({ type: Object })
    option!: INodeOption|INodeInterface;

    get isAdvancedMode() {
        return !this.items.every((i) => typeof(i) === "string");
    }

    get selectedText() {
        if (this.isAdvancedMode) {
            return this.getItemByValue(this.value)?.text ?? "";
        } else if(this.value) {
            return this.value;
        } else {
            return "";
        }
    }

    mounted() {
        // computed property won't work here due to missing reactivity
        this.items = this.option.items || [];
        this.option.events.updated.addListener(this, () => {
            this.items = this.option.items || [];
        });
    }

    beforeDestroy() {
        this.option.events.updated.removeListener(this);
    }

    isSelected(item: ItemType) {
        if (this.isAdvancedMode) {
            return (item as IAdvancedItem).value === this.value;
        } else {
            return item === this.value;
        }
    }

    setSelected(item: ItemType) {
        this.$emit("input", this.isAdvancedMode ? (item as IAdvancedItem).value : item as string);
    }

    getItemByValue(value: any) {
        return (this.items as IAdvancedItem[]).find((i) => i.value === value);
    }

}
</script>
