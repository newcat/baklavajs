<template>
    <button @click="onClick" class="dark-button --block">{{ io.name }}</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ButtonOption } from "./ButtonOption";

export default defineComponent({
    props: {
        io: {
            type: Object as () => ButtonOption,
            required: true,
        },
    },
    setup(props) {
        const onClick = () => {
            if (props.io.callback) {
                props.io.callback();
            }
        };

        return { onClick };
    },
});
</script>
