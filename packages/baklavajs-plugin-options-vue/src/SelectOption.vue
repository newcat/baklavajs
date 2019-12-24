<template>
<div
    :class="['dark-select', { '--open': open }]"
    @click="open = !open"
    v-click-outside="() => { open = false; }"
>
    <div class="__selected">
        <div class="__text">{{ selected }}</div>
        <div class="__icon">
            <i-arrow></i-arrow>
        </div>
    </div>
    <transition name="slide-fade">
        <div class="__dropdown" v-show="open">
            <div class="item --header">{{ name }}</div>
            <div
                v-for="item in items"
                :key="item"
                :class="['item', { '--active': selected === item }]"
                @click="setSelected(item)"
            >{{ item }}</div>
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

    @Prop({ type: String })
    value!: any;

    @Prop({ type: Object })
    option!: INodeOption;

    get selected() {
        return this.value || "";
    }

    get items() {
        return this.option.items || [];
    }

    setSelected(item: string) {
        this.$emit("input", item);
    }

}
</script>
