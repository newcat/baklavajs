<template>
    <div>{{ intf.value }}</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TextInterface } from "./TextInterface";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => TextInterface,
            required: true,
        },
    },
});
</script>
