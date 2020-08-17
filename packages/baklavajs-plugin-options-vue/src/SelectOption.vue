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
import { INodeOption } from "../../baklavajs-core/types";

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

    @Prop({ type: String })
    name!: string;

    @Prop()
    value!: any;

    @Prop({ type: Object })
    option!: INodeOption;

    get isAdvancedMode() {
        return !this.items.every((i) => typeof(i) === "string");
    }

    get selectedText() {
        if (this.value) {
            return this.isAdvancedMode ?
                this.getItemByValue(this.value)?.text ?? "" :
                this.value;
        } else {
            return "";
        }
    }

    get items(): ItemType[] {
        return this.option.items || [];
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
