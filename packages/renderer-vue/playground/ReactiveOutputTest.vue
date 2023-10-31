<template>
    <button @click="add">{{ modelValue }}</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        modelValue: {
            type: Number,
            // readonly: false,
            required: true,
        },
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const add = () => {
            console.log("modelValue", props.modelValue);
            console.log("modelValue", props);
            emit("update:modelValue", props.modelValue + 1);
            console.log("modelValue+1", props.modelValue);
        };
        return { add };
    },
});
</script>
