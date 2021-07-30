<template>
    <button @click="$emit('openSidebar')" class="dark-button --block">{{ name }}</button>
</template>

<script lang="ts">
import { Options, Prop, Vue } from "vue-property-decorator";

@Options({
    emits: ["openSidebar"]
})
export default class ButtonOption extends Vue {

    @Prop({ type: String })
    name!: string;

}
</script>
