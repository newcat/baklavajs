<script setup lang="ts">
import Multiselect from "@vueform/multiselect";
import { ref, watch, toValue } from "vue";
import type { AsyncSelectInterface } from "./AsyncSelectInterface";

const props = defineProps<{
    intf: AsyncSelectInterface<unknown>;
}>();

const valued = ref(props.intf.value);
const el = ref<HTMLElement | null>(null);
watch(valued, () => {
    props.intf.value = toValue(valued);
});
</script>

<template>
    <div>
        <label class="typo__label" for="ajax">{{ props.intf.name }}</label>
        <Multiselect
            ref="el"
            v-model="valued"
            :options="props.intf.callback"
            :filter-results="false"
            :resolve-on-load="true"
            :delay="0"
            :searchable="true"
            :object="true"
        />
    </div>
</template>
<style src="@vueform/multiselect/themes/default.css"></style>
<style>
.multiselect {
    color: black;
}
</style>
