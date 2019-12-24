<template>
    <div class="dark-num-input">
        <div @click="decrement" class="__button --dec">
            <i-arrow></i-arrow>
        </div>
        <div
            v-if="!editMode"
            class="__content"
            @click="enterEditMode"
        >
            <div class="__label .text-truncate">{{ name }}</div>
            <div class="__value">{{ stringRepresentation }}</div>
        </div>
        <div v-else class="__content">
            <input
                type="number"
                v-model="tempValue"
                ref="input"
                @blur="leaveEditMode"
            >
        </div>
        <div @click="increment" class="__button --inc">
            <i-arrow></i-arrow>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Arrow from "./Arrow.vue";
import { BaseNumericOption } from "./BaseNumericOption";

@Component({
    components: {
        "i-arrow": Arrow
    }
})
export default class IntegerOption extends BaseNumericOption {

    get v() {
        if (typeof(this.value) === "string") {
            return parseInt(this.value, 10);
        } else if (typeof(this.value) === "number") {
            return Math.floor(this.value);
        } else {
            return 0;
        }
    }

    get stringRepresentation() {
        const s = this.v.toString();
        return s.length > this.MAX_STRING_LENGTH ?
            this.v.toExponential(this.MAX_STRING_LENGTH - 5) :
            s;
    }

    increment() {
        this.setValue(this.v + 1);
    }

    decrement() {
        this.setValue(this.v - 1);
    }

    leaveEditMode() {
        const v = parseInt(this.tempValue, 10);
        if (!this.validate(v)) {
            this.invalid = true;
        } else {
            this.$emit("input", v);
            this.editMode = false;
        }
    }

}
</script>