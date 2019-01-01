<template>
    <input :value="value" @input="$emit('input', $event.target.value)" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class TestOption extends Vue {

    type = "TestOption";

    @Prop()
    value!: string;

}
</script>

