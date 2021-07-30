<template>
    <div>
        <input
            type="text"
            class="dark-input"
            :value="value"
            v-on="listeners"
            :placeholder="name"
        >
    </div>
</template>

<script lang="ts">
import { Options, Prop, Vue } from "vue-property-decorator";

@Options({
    emits: ["input"]
})
export default class InputOption extends Vue {

    @Prop({ type: String, default: "" })
    value!: string;

    @Prop({ type: String })
    name!: string;

    get listeners(): any {
        return { ...this.listeners, input: (ev: any) => this.$emit("input", ev.target.value) };
    }

}
</script>