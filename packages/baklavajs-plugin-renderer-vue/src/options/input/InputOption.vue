<template>
    <div>
        <input type="text" class="dark-input" v-model="io.value" :placeholder="io.name" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { InputOption } from "./InputOption";

export default defineComponent({
    props: {
        io: {
            type: Object as () => InputOption,
            required: true,
        },
    },
});
</script>
