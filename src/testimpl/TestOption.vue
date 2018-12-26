<template>
    <div>
        <p>{{ data }}</p>
        <input v-model="data" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import INodeOption from "@/model/nodeOption";

@Component
export default class TestOption extends Vue implements INodeOption {

    type = "TestOption";

    data = "";

    loadState(state: string) {
        this.data = state;
    }

    getState() {
        return this.data;
    }

}
</script>

