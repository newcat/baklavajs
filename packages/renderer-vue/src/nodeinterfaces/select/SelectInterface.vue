<template>
    <div ref="el" class="baklava-select" :class="{ '--open': open }" :title="intf.name" @click="open = !open">
        <div class="__selected">
            <div class="__text">
                {{ selectedText }}
            </div>
            <div class="__icon">
                <i-arrow />
            </div>
        </div>
        <transition name="slide-fade">
            <div v-show="open" class="__dropdown">
                <div class="item --header">
                    {{ intf.name }}
                </div>
                <div
                    v-for="(item, i) in intf.items"
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
import { onClickOutside } from "@vueuse/core";
import { computed, defineComponent, Ref, ref } from "vue";
import Arrow from "../../icons/ChevronDown.vue";
import type { SelectInterface, SelectInterfaceItem } from "./SelectInterface";

export default defineComponent({
    components: {
        "i-arrow": Arrow,
    },
    props: {
        intf: {
            type: Object as () => SelectInterface<unknown>,
            required: true,
        },
    },
    setup(props) {
        const el = ref<HTMLElement | null>(null) as Ref<HTMLElement | null>;
        const open = ref(false);

        const selectedItem = computed(() =>
            props.intf.items.find((v) =>
                typeof v === "string" ? v === props.intf.value : v.value === props.intf.value,
            ),
        );

        const selectedText = computed(() => {
            if (selectedItem.value) {
                return typeof selectedItem.value === "string" ? selectedItem.value : selectedItem.value.text;
            } else {
                return "";
            }
        });

        const setSelected = (item: SelectInterfaceItem<unknown>) => {
            props.intf.value = typeof item === "string" ? item : item.value;
        };

        onClickOutside(el, () => {
            open.value = false;
        });

        return { el, open, selectedItem, selectedText, setSelected };
    },
});
</script>
