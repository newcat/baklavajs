<template>
    <button @click="onClick">{{ name }}</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AdvancedNode from "./AdvancedNode";

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true
        },
        node: {
            type: Object as () => AdvancedNode,
            required: true
        }
    },
    setup(props) {
        const onClick = () => {
            props.node.action(props.name);
        };
        return { onClick };
    }
});
</script>
