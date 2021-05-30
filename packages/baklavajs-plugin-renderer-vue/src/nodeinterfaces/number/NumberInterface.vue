<template>
    <div class="dark-num-input">
        <div @click="decrement" class="__button --dec">
            <i-arrow></i-arrow>
        </div>
        <div v-if="!editMode" class="__content" @click="enterEditMode">
            <div class="__label" :title="intf.name">{{ intf.name }}</div>
            <div class="__value">{{ stringRepresentation }}</div>
        </div>
        <div v-else class="__content">
            <input
                type="number"
                v-model="tempValue"
                class="dark-input"
                :class="{ '--invalid': invalid }"
                ref="inputEl"
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
import Arrow from "../icons/Arrow.vue";
import { useBaseNumericInterface } from "../baseNumericInterface";
import type { NumberInterface } from "./NumberInterface";

export default defineComponent({
    components: {
        "i-arrow": Arrow,
    },
    props: {
        intf: {
            type: Object as () => NumberInterface,
            required: true,
        },
    },
    setup(props) {
        const baseNumericInterface = useBaseNumericInterface(toRef(props, "intf") as Ref<NumberInterface>);

        const increment = () => {
            baseNumericInterface.setValue(props.intf.value + 0.1);
        };

        const decrement = () => {
            baseNumericInterface.setValue(props.intf.value - 0.1);
        };

        return { ...baseNumericInterface, increment, decrement };
    },
});
</script>
