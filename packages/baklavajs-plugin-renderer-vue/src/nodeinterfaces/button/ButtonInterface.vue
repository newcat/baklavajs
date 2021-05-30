<template>
    <button class="dark-button --block" :title="intf.name" @click="onClick">{{ intf.name }}</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ButtonInterface } from "./ButtonInterface";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => ButtonInterface,
            required: true,
        },
    },
    setup(props) {
        const onClick = () => {
            if (props.intf.callback) {
                props.intf.callback();
            }
        };

        return { onClick };
    },
});
</script>
