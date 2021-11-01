<template>
    <button class="baklava-button --block" :title="intf.name" @click="onClick">
        {{ intf.name }}
    </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NodeInterface } from "@baklavajs/core";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => NodeInterface,
            required: true,
        },
    },
    emits: ["openSidebar"],
    setup(props, { emit }) {
        const onClick = () => {
            emit("openSidebar");
        };

        return { onClick };
    },
});
</script>
