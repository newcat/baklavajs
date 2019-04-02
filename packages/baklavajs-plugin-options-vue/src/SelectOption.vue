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

    @Prop({ type: Object })
    value!: any;

    get selected() {
        return this.value ? this.value.selected : "";
    }

    get items() {
        return this.value ? this.value.items : [];
    }

    setSelected(item: string) {
        this.$emit("input", { selected: item, items: this.items });
    }

}
</script>
