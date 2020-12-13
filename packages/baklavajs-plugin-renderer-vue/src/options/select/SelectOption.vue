<template>
    <div
        :class="['dark-select', { '--open': open }]"
        @click="open = !open"
        v-click-outside="
            () => {
                open = false;
            }
        "
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
                >
                    {{ typeof item === "string" ? item : item.text }}
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import Arrow from "../icons/Arrow.vue";
import type { SelectOption } from "./SelectOption";

export default defineComponent({
    components: {
        "i-arrow": Arrow,
    },
    directives: {
        ClickOutside: ClickOutside.directive,
    },
    props: {
        io: {
            type: Object as () => SelectOption,
            required: true,
        },
    },
    setup(props) {
        const open = ref(false);

        const selectedText = computed(() => {});
    },
});

// @ts-ignore
import ClickOutside from "v-click-outside";

class SsdelectOption extends Vue {
    get isAdvancedMode() {
        return !this.items.every((i) => typeof i === "string");
    }

    get selectedText() {
        if (this.value) {
            return this.isAdvancedMode ? this.getItemByValue(this.value)?.text ?? "" : this.value;
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
        this.$emit("input", this.isAdvancedMode ? (item as IAdvancedItem).value : (item as string));
    }

    getItemByValue(value: any) {
        return (this.items as IAdvancedItem[]).find((i) => i.value === value);
    }
}
</script>
