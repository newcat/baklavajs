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
import { Component, Vue, Prop } from "vue-property-decorator";
import { INodeOption } from "../../baklavajs-core/types";

@Component
export default class SliderOption extends Vue {

    MAX_STRING_LENGTH = 9;

    editMode = false;
    didSlide = false;
    isMouseDown = false;
    tempValue = "0";
    invalid = false;

    @Prop({ type: String })
    name!: string;

    @Prop({ type: Number })
    value!: any;

    @Prop({ type: Object })
    option!: INodeOption;

    get v() {
        if (typeof(this.value) === "string") {
            return parseFloat(this.value);
        } else if (typeof(this.value) === "number") {
            return this.value;
        } else {
            return 0;
        }
    }

    get stringRepresentation() {
        const s = this.v.toFixed(3);
        return s.length > this.MAX_STRING_LENGTH ?
            this.v.toExponential(this.MAX_STRING_LENGTH - 5) :
            s;
    }

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

    async enterEditMode() {
        this.tempValue = this.value.toFixed(3);
        this.editMode = true;
        await this.$nextTick();
        (this.$refs.input as HTMLElement).focus();
    }

    leaveEditMode() {
        const v = parseFloat(this.tempValue);
        if (!this.validate(v)) {
            this.invalid = true;
        } else {
            this.$emit("input", v);
            this.editMode = false;
        }
    }

    validate(v: number) {
        if (Number.isNaN(v)) {
            return false;
        } else if (typeof(this.option.min) === "number" && v < this.option.min) {
            return false;
        } else if (typeof(this.option.max) === "number" && v > this.option.max) {
            return false;
        } else {
            return true;
        }
    }

}
</script>
