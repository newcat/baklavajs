<template>
    <div>
        <input type="text" class="dark-input" v-model="intf.value" :placeholder="intf.name" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { InputInterface } from "./InputInterface";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => InputInterface,
            required: true,
        },
    },
});
</script>
