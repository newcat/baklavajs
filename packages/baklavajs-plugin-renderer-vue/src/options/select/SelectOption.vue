<template>
    <div :class="['dark-select', { '--open': open }]" @click="open = !open" v-click-outside="(open = false)">
        <div class="__selected">
            <div class="__text">{{ selectedText }}</div>
            <div class="__icon">
                <i-arrow></i-arrow>
            </div>
        </div>
        <transition name="slide-fade">
            <div class="__dropdown" v-show="open">
                <div class="item --header">{{ io.name }}</div>
                <div
                    v-for="(item, i) in items"
                    :key="i"
                    :class="['item', { '--active': item === selectedItem }]"
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
import type { SelectOption, SelectOptionItem } from "./SelectOption";

// @ts-ignore
import ClickOutside from "v-click-outside";

export default defineComponent({
    components: {
        "i-arrow": Arrow,
    },
    directives: {
        ClickOutside: ClickOutside.directive,
    },
    props: {
        io: {
            type: Object as () => SelectOption<unknown>,
            required: true,
        },
    },
    setup(props) {
        const open = ref(false);

        const selectedItem = computed(() =>
            props.io.items.find((v) => (typeof v === "string" ? v === props.io.value : v.value === props.io.value))
        );

        const selectedText = computed(() => {
            if (selectedItem.value) {
                return typeof selectedItem.value === "string" ? selectedItem : selectedItem.value.text;
            } else {
                return "";
            }
        });

        const setSelected = (item: SelectOptionItem<unknown>) => {
            props.io.value = typeof item === "string" ? item : item.value;
        };

        return { open, selectedItem, selectedText, setSelected };
    },
});
</script>
