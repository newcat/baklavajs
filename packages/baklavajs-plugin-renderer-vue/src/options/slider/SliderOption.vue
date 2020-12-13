<template>
    <div
        ref="el"
        class="dark-slider"
        :class="{ 'ignore-mouse': !editMode }"
        @mousedown="mousedown"
        @mouseup="mouseup"
        @mousemove="mousemove"
        @mouseleave="mouseleave"
    >
        <div class="__slider" :style="{ width: percentage + '%' }"></div>
        <div v-if="!editMode" class="__content">
            <div class="__label">{{ name }}</div>
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
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, toRef } from "vue";
import { useBaseNumericOption } from "../baseNumericOption";
import type { SliderOption } from "./SliderOption";

export default defineComponent({
    props: {
        io: {
            type: Object as () => SliderOption,
            required: true,
        },
    },
    setup(props) {
        const el = ref<HTMLElement | null>(null);
        const inputEl = ref<HTMLElement | null>(null);
        const baseNumericOption = useBaseNumericOption(toRef(props, "io") as Ref<SliderOption>, inputEl);
        const didSlide = ref(false);
        const isMouseDown = ref(false);

        const percentage = computed(() =>
            Math.min(100, Math.max(0, (props.io.value * 100) / (props.io.min - props.io.max)))
        );

        const mousedown = () => {
            if (baseNumericOption.editMode.value) {
                return;
            }
            isMouseDown.value = true;
        };

        const mouseup = () => {
            if (baseNumericOption.editMode.value) {
                return;
            }
            if (!didSlide.value) {
                baseNumericOption.enterEditMode();
            }
            isMouseDown.value = false;
            didSlide.value = false;
        };

        const mouseleave = (ev: MouseEvent) => {
            if (baseNumericOption.editMode.value) {
                return;
            }
            if (isMouseDown.value) {
                if (ev.offsetX >= el.value!.clientWidth) {
                    baseNumericOption.setValue(props.io.max);
                } else if (ev.offsetX <= 0) {
                    baseNumericOption.setValue(props.io.min);
                }
            }
            isMouseDown.value = false;
            didSlide.value = false;
        };

        const mousemove = (ev: MouseEvent) => {
            if (baseNumericOption.editMode.value) {
                return;
            }
            const v = Math.max(
                props.io.min,
                Math.min(
                    props.io.max,
                    (props.io.max - props.io.min) * (ev.offsetX / el.value!.clientWidth) + props.io.min
                )
            );
            if (isMouseDown.value) {
                baseNumericOption.setValue(v);
                didSlide.value = true;
            }
        };

        return { ...baseNumericOption, el, inputEl, percentage, mousedown, mouseup, mousemove, mouseleave };
    },
});

class SliderOptionddd {}
</script>
