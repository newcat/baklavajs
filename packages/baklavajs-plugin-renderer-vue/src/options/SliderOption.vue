<template>
<div class="dark-slider" :class="{ 'ignore-mouse': !editMode }"
    @mousedown="mousedown" @mouseup="mouseup" @mousemove="mousemove" @mouseleave="mouseleave">
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
            ref="input"
            @blur="leaveEditMode"
            @keydown.enter="leaveEditMode"
            style="text-align: right;"
        >
    </div>
</div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { BaseNumericOption } from "./BaseNumericOption";

@Component
export default class SliderOption extends BaseNumericOption {

    didSlide = false;
    isMouseDown = false;

    get min() {
        return this.option.min || 0;
    }

    get max() {
        return this.option.max || 1;
    }

    get percentage() {
        return Math.min(100, Math.max(0, (this.v * 100) / (this.max - this.min)));
    }

    mousedown() {
        if (this.editMode) { return; }
        this.isMouseDown = true;
    }

    mouseup() {
        if (this.editMode) { return; }
        if (!this.didSlide) {
            this.enterEditMode();
        }
        this.isMouseDown = false;
        this.didSlide = false;
    }

    mouseleave(ev: MouseEvent) {
        if (this.editMode) { return; }
        if (this.isMouseDown) {
            if (ev.offsetX >= this.$el.clientWidth) {
                this.$emit("input", this.max);
            } else if (ev.offsetX <= 0) {
                this.$emit("input", this.min);
            }
        }
        this.isMouseDown = false;
        this.didSlide = false;
    }

    mousemove(ev: MouseEvent) {
        if (this.editMode) { return; }
        const v = Math.max(this.min, Math.min(this.max, (this.max - this.min) * (ev.offsetX / this.$el.clientWidth) + this.min));
        if (this.isMouseDown) {
            this.$emit("input", v);
            this.didSlide = true;
        }
    }

}
</script>
