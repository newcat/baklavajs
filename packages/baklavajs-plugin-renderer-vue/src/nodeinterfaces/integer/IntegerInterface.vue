<template>
    <div class="dark-num-input">
        <div @click="decrement" class="__button --dec">
            <i-arrow></i-arrow>
        </div>
        <div v-if="!editMode" class="__content" @click="enterEditMode">
            <div class="__label .text-truncate">{{ intf.name }}</div>
            <div class="__value">{{ stringRepresentation }}</div>
        </div>
        <div v-else class="__content">
            <input type="number" v-model="tempValue" ref="inputEl" @blur="leaveEditMode" />
        </div>
        <div @click="increment" class="__button --inc">
            <i-arrow></i-arrow>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, toRef } from "vue";
import Arrow from "../icons/Arrow.vue";
import { useBaseNumericInterface } from "../baseNumericInterface";
import type { IntegerInterface } from "./IntegerInterface";

export default defineComponent({
    components: {
        "i-arrow": Arrow,
    },
    props: {
        intf: {
            type: Object as () => IntegerInterface,
            required: true,
        },
    },
    setup(props) {
        const inputEl = ref<HTMLElement | null>(null);
        const baseNumericInterface = useBaseNumericInterface(toRef(props, "intf") as Ref<IntegerInterface>, inputEl);

        const increment = () => {
            baseNumericInterface.setValue(props.intf.value + 1);
        };

        const decrement = () => {
            baseNumericInterface.setValue(props.intf.value - 1);
        };

        return { ...baseNumericInterface, inputEl, increment, decrement };
    },
});
</script>
