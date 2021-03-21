<template>
    <div>
        <input type="text" class="dark-input" v-model="v" :placeholder="intf.name" />
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
            required: true
        }
    },
    setup(props, { emit }) {
        const v = computed({
            get: () => props.modelValue,
            set: (v) => {
                emit("update:modelValue", v);
            }
        });
        return { v };
    }
});
</script>
