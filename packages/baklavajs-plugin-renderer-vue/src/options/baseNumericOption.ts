import { computed, nextTick, Ref, ref, watch } from "vue";
import { INodeIO, NodeOption } from "@baklavajs/core";

const MAX_STRING_LENGTH = 9;

export interface IValidator {
    validate: (v: number) => boolean;
}

function isValidator(io: any): io is IValidator {
    return "validate" in io;
}

export class BaseNumericOption extends NodeOption<number> implements IValidator {
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

export const useBaseNumericOption = (io: Ref<INodeIO<number>>, inputRef: Ref<HTMLElement | null>) => {
    const editMode = ref(false);
    const invalid = ref(false);
    const tempValue = ref("0");

    const stringRepresentation = computed(() => {
        const s = io.value.value.toFixed(3);
        return s.length > MAX_STRING_LENGTH ? io.value.value.toExponential(MAX_STRING_LENGTH - 5) : s;
    });

    const validate = (v: number) => {
        if (Number.isNaN(v)) {
            return false;
        } else if (isValidator(io.value)) {
            return io.value.validate(v);
        } else {
            return true;
        }
    };

    const setValue = (newValue: number) => {
        if (validate(newValue)) {
            io.value.value = newValue;
        }
    };

    watch(tempValue, () => {
        invalid.value = false;
    });

    const enterEditMode = async () => {
        tempValue.value = io.value.value.toFixed(3);
        editMode.value = true;
        await nextTick();
        if (inputRef.value) {
            inputRef.value.focus();
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

    return { editMode, invalid, tempValue, stringRepresentation, validate, setValue, enterEditMode, leaveEditMode };
};
