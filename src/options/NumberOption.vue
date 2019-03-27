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

@Component({
    components: {
        "i-arrow": Arrow
    }
})
export default class NumberOption extends Vue {

    MAX_STRING_LENGTH = 9;

    @Prop()
    value!: any;

    @Prop({ type: String })
    name!: string;

    editMode = false;
    tempValue = "0";

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

    increment() {
        this.$emit("input", this.v + 0.1);
    }

    decrement() {
        this.$emit("input", this.v - 0.1);
    }

    async enterEditMode() {
        this.tempValue = this.v.toFixed(3);
        this.editMode = true;
        await this.$nextTick();
        (this.$refs.input as HTMLElement).focus();
    }

    leaveEditMode() {
        this.$emit("input", parseFloat(this.tempValue));
        this.editMode = false;
    }

}
</script>