<template>
    <div>{{ io.value }}</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TextOption } from "./TextOption";

export default defineComponent({
    props: {
        io: {
            type: Object as () => TextOption,
            required: true,
        },
    },
});
</script>
