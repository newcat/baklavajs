import { computed, nextTick, Ref, ref, watch } from "vue";
import { NodeInterface } from "@baklavajs/core";

const MAX_STRING_LENGTH = 9;

export interface IValidator {
    validate: (v: number) => boolean;
}

function isValidator(intf: any): intf is IValidator {
    return "validate" in intf;
}

export class BaseNumericInterface extends NodeInterface<number> implements IValidator {
    public min?: number;
    public max?: number;

    constructor(name: string, value: number, min?: number, max?: number) {
        super(name, value);
        this.min = min;
        this.max = max;
    }

    public validate(v: number) {
        return (!this.min || v >= this.min) && (!this.max || v <= this.max);
    }
}

export const useBaseNumericInterface = (intf: Ref<NodeInterface<number>>, precision = 3) => {
    const inputEl = ref<HTMLInputElement | null>(null);
    const editMode = ref(false);
    const invalid = ref(false);
    const tempValue = ref("0");

    const stringRepresentation = computed(() => {
        const s = intf.value.value.toFixed(precision);
        return s.length > MAX_STRING_LENGTH ? intf.value.value.toExponential(MAX_STRING_LENGTH - 5) : s;
    });

    const validate = (v: number) => {
        if (Number.isNaN(v)) {
            return false;
        } else if (isValidator(intf.value)) {
            return intf.value.validate(v);
        } else {
            return true;
        }
    };

    const setValue = (newValue: number) => {
        if (validate(newValue)) {
            intf.value.value = newValue;
        }
    };

    watch(tempValue, () => {
        invalid.value = false;
    });

    const enterEditMode = async () => {
        tempValue.value = intf.value.value.toFixed(precision);
        editMode.value = true;
        await nextTick();
        if (inputEl.value) {
            inputEl.value.focus();
        }
    };

    const leaveEditMode = () => {
        const v = parseFloat(tempValue.value);
        if (!validate(v)) {
            invalid.value = true;
        } else {
            setValue(v);
            editMode.value = false;
        }
    };

    return {
        editMode,
        invalid,
        tempValue,
        inputEl,
        stringRepresentation,
        validate,
        setValue,
        enterEditMode,
        leaveEditMode,
    };
};
