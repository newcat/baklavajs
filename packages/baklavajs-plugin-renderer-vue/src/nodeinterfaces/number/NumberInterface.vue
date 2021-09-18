<template>
    <div class="baklava-num-input">
        <div class="__button --dec" @click="decrement">
            <i-arrow />
        </div>
        <div v-if="!editMode" class="__content" @click="enterEditMode">
            <div class="__label" :title="intf.name">
                {{ intf.name }}
            </div>
            <div class="__value">
                {{ stringRepresentation }}
            </div>
        </div>
        <div v-else class="__content">
            <input
                ref="inputEl"
                v-model="tempValue"
                type="number"
                class="baklava-input"
                :class="{ '--invalid': invalid }"
                style="text-align: right"
                @blur="leaveEditMode"
                @keydown.enter="leaveEditMode"
            >
        </div>
        <div class="__button --inc" @click="increment">
            <i-arrow />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, Ref, toRef } from "vue";
import Arrow from "../../icons/ChevronDown.vue";
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
