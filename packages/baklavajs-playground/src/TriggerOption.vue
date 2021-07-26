<template>
    <div>
        <button-option name="Test Sidebar" @openSidebar="$emit('openSidebar')"></button-option>
        <p>{{ value.testtext }}</p>
    </div>
</template>

<script lang="ts">
import { Options, Prop, Vue } from "vue-property-decorator";
import { ButtonOption } from "../../baklavajs-plugin-options-vue/src";

@Options({
    components: { ButtonOption }
})
export default class TriggerOption extends Vue {

    @Prop()
    value!: any;

}
</script>

