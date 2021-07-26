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
                class="dark-input"
                :class="{ '--invalid': invalid }"
                ref="input"
                @blur="leaveEditMode"
                @keydown.enter="leaveEditMode"
                style="text-align: right;"
            >
        </div>
        <div @click="increment" class="__button --inc">
            <i-arrow></i-arrow>
        </div>
    </div>
</template>

<script lang="ts">
import { Options } from "vue-property-decorator";
import Arrow from "./Arrow.vue";
import { BaseNumericOption } from "./BaseNumericOption";

@Options({
    components: {
        "i-arrow": Arrow
    }
})
export default class NumberOption extends BaseNumericOption {

    increment() {
        this.setValue(this.v + 0.1);
    }

    decrement() {
        this.setValue(this.v - 0.1);
    }

}
</script>