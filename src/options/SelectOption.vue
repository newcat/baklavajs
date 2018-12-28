<template>
<div
    :class="['dark-select', { '--open': open }]"
    @click="open = !open"
    v-click-outside="() => { open = false; }"
>
    <div class="__selected">
        <div class="__text">{{ selected }}</div>
        <div class="__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path class="dark-foreground" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                <path fill="none" d="M0 0h24v24H0V0z"/>
            </svg>
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

// @ts-ignore
import ClickOutside from "v-click-outside";

@Component({
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

<style>

</style>

