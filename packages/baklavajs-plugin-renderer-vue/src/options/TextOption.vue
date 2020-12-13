<template>
    <div>{{ sanitized }}</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class TextOption extends Vue {

    get sanitized() {
        return String(this.value);
    }

    @Prop({ default: "" })
    value!: string;

}
</script>