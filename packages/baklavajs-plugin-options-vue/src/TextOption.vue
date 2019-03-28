<template>
    <div>{{ value }}</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class TextOption extends Vue {

    @Prop({ type: String, default: "" })
    value!: string;

}
</script>