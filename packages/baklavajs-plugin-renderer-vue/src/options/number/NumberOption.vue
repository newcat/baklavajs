<template>
    <div class="dark-num-input">
        <div @click="decrement" class="__button --dec">
            <i-arrow></i-arrow>
        </div>
        <div v-if="!editMode" class="__content" @click="enterEditMode">
            <div class="__label .text-truncate">{{ io.name }}</div>
            <div class="__value">{{ stringRepresentation }}</div>
        </div>
        <div v-else class="__content">
            <input
                type="number"
                v-model="tempValue"
                class="dark-input"
                :class="{ '--invalid': invalid }"
                ref="input"
                @blur="leaveEditMode"
                @keydown.enter="leaveEditMode"
                style="text-align: right"
            />
        </div>
        <div @click="increment" class="__button --inc">
            <i-arrow></i-arrow>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, toRef } from "vue";
import Arrow from "./Arrow.vue";
import { useBaseNumericOption } from "../baseNumericOption";
import type { NumberOption } from "./NumberOption";

export default defineComponent({
    components: {
        "i-arrow": Arrow,
    },
    props: {
        io: {
            type: Object as () => NumberOption,
            required: true,
        },
    },
    setup(props) {
        const inputEl = ref<HTMLElement | null>(null);
        const baseNumericOption = useBaseNumericOption(toRef(props, "io") as Ref<IntegerOption>, inputEl);

        const increment = () => {
            baseNumericOption.setValue(props.io.value + 0.1);
        };

        const decrement = () => {
            baseNumericOption.setValue(props.io.value - 0.1);
        };

        return { ...baseNumericOption, inputEl, increment, decrement };
    },
});
</script>
