<template>
    <div>
        <input type="text" class="dark-input" v-model="intf.value" :placeholder="intf.name" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { TextInputInterface } from "./TextInputInterface";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => TextInputInterface,
            required: true,
        },
    },
});
</script>
