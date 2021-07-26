<template>
    <div>{{ sanitized }}</div>
</template>

<script lang="ts">
import { Prop, Vue } from "vue-property-decorator";

export default class TextOption extends Vue {

    get sanitized() {
        return String(this.value);
    }

    @Prop({ default: "" })
    value!: string;

}
</script>