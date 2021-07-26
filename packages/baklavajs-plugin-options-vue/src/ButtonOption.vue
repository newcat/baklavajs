<template>
    <button @click="$emit('openSidebar')" class="dark-button --block">{{ name }}</button>
</template>

<script lang="ts">
import { Prop, Vue } from "vue-property-decorator";

export default class ButtonOption extends Vue {

    @Prop({ type: String })
    name!: string;

}
</script>
