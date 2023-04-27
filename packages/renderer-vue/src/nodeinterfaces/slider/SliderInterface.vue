<template>
    <div
        ref="el"
        class="baklava-slider"
        :class="{ 'baklava-ignore-mouse': !editMode }"
        @pointerdown="mousedown"
        @pointerup="mouseup"
        @pointermove="mousemove"
        @pointerleave="mouseleave"
    >
        <div class="__slider" :style="{ width: percentage + '%' }" />
        <div v-if="!editMode" class="__content">
            <div class="__label">
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
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, toRef } from "vue";
import { useBaseNumericInterface } from "../baseNumericInterface";
import type { SliderInterface } from "./SliderInterface";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => SliderInterface,
            required: true,
        },
    },
    setup(props) {
        const el = ref<HTMLElement | null>(null);
        const baseNumericInterface = useBaseNumericInterface(toRef(props, "intf"));
        const didSlide = ref(false);
        const isMouseDown = ref(false);

        const percentage = computed(() =>
            Math.min(100, Math.max(0, ((props.intf.value - props.intf.min) * 100) / (props.intf.max - props.intf.min))),
        );

        const mousedown = () => {
            if (baseNumericInterface.editMode.value) {
                return;
            }
            isMouseDown.value = true;
        };

        const mouseup = () => {
            if (baseNumericInterface.editMode.value) {
                return;
            }
            if (!didSlide.value) {
                void baseNumericInterface.enterEditMode();
            }
            isMouseDown.value = false;
            didSlide.value = false;
        };

        const mouseleave = (ev: MouseEvent) => {
            if (baseNumericInterface.editMode.value) {
                return;
            }
            if (isMouseDown.value) {
                if (ev.offsetX >= el.value!.clientWidth) {
                    baseNumericInterface.setValue(props.intf.max);
                } else if (ev.offsetX <= 0) {
                    baseNumericInterface.setValue(props.intf.min);
                }
            }
            isMouseDown.value = false;
            didSlide.value = false;
        };

        const mousemove = (ev: MouseEvent) => {
            if (baseNumericInterface.editMode.value) {
                return;
            }
            const v = Math.max(
                props.intf.min,
                Math.min(
                    props.intf.max,
                    (props.intf.max - props.intf.min) * (ev.offsetX / el.value!.clientWidth) + props.intf.min,
                ),
            );
            if (isMouseDown.value) {
                baseNumericInterface.setValue(v);
                didSlide.value = true;
            }
        };

        return { ...baseNumericInterface, el, percentage, mousedown, mouseup, mousemove, mouseleave };
    },
});
</script>
