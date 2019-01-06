<template>
    <div>
        <input
            type="text"
            class="dark-input"
            :value="value"
            @input="$emit('input', $event.target.value)"
            :placeholder="name"
        >
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class InputOption extends Vue {

    @Prop({ type: String, default: "" })
    value!: string;

    @Prop({ type: String })
    name!: string;

}
</script>