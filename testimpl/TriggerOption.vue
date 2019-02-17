<template>
    <div>
        <button-option name="Test Sidebar" @openSidebar="$emit('openSidebar')"></button-option>
        <p>{{ value.testtext }}</p>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Options } from "../src/index";

@Component({
    components: {
        ButtonOption: Options.ButtonOption
    }
})
export default class TriggerOption extends Vue {

    @Prop()
    value!: any;

}
</script>

