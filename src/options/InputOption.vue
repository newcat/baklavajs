<template>
    <input type="text" class="dark-input" :value="value" @input="$emit('input', $event.target.value)">
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class InputOption extends Vue {

    @Prop({ type: String, default: "" })
    value!: string;

}
</script>