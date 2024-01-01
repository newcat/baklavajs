<template>
    <div class="baklava-num-input">
        <div class="__button --dec" @click="decrement">
            <IconArrow />
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
            />
        </div>
        <div class="__button --inc" @click="increment">
            <IconArrow />
        </div>
    </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import IconArrow from "../../icons/ChevronDown.vue";
import { useBaseNumericInterface } from "../baseNumericInterface";
import type { NumberInterface } from "./NumberInterface";

const props = defineProps<{
    intf: NumberInterface;
}>();

const { editMode, invalid, tempValue, inputEl, stringRepresentation, enterEditMode, leaveEditMode, setValue } =
    useBaseNumericInterface(toRef(props, "intf"));

function increment() {
    // round to 3 decimal places
    const rounded = parseFloat((props.intf.value + 0.1).toFixed(3));
    setValue(rounded);
}

function decrement() {
    // round to 3 decimal places
    const rounded = parseFloat((props.intf.value - 0.1).toFixed(3));
    setValue(rounded);
}
</script>
