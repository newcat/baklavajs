<template>
    <div>
        <input v-model="v" type="text" class="baklava-input" :placeholder="intf.name" :title="intf.name">
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import type { TextInputInterface } from "./TextInputInterface";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => TextInputInterface,
            required: true,
        },
        modelValue: {
            type: String,
            required: true,
        },
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const v = computed({
            get: () => props.modelValue,
            set: (v) => {
                emit("update:modelValue", v);
            },
        });
        return { v };
    },
});
</script>
