<template>
    <div @click="$emit('input', !value)" :class="{ 'dark-checkbox': true, '--checked': value }">
        <div class="__checkmark-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                <path
                    class="__checkmark"
                    d="M 6 5 L 6 10 L 16 10"
                    transform="rotate(-45 10 10)"
                ></path>
            </svg>
        </div>
        <div class="ml-2">{{ name }}</div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class InputOption extends Vue {

    @Prop({ type: Boolean })
    value!: boolean;

    @Prop({ type: String })
    name!: string;

}
</script>
