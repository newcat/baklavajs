<template>
    <button @click="$emit('openSidebar')" class="dark-button --block">{{ name }}</button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ButtonOption extends Vue {

    @Prop({ type: String })
    name!: string;

}
</script>
