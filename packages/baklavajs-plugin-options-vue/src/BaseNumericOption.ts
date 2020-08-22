import { Prop, Vue, Watch, Component } from "vue-property-decorator";
import { INodeInterface, INodeOption } from "../../baklavajs-core/types";

@Component
export class BaseNumericOption extends Vue {
    MAX_STRING_LENGTH = 9;

    @Prop()
    value!: any;

    @Prop({ type: String })
    name!: string;

    @Prop({ type: Object })
    option!: INodeOption | INodeInterface;

    editMode = false;
    invalid = false;
    tempValue = "0";

    get v() {
        if (typeof this.value === "string") {
            return parseFloat(this.value);
        } else if (typeof this.value === "number") {
            return this.value;
        } else {
            return 0;
        }
    }

    get stringRepresentation() {
        const s = this.v.toFixed(3);
        return s.length > this.MAX_STRING_LENGTH ? this.v.toExponential(this.MAX_STRING_LENGTH - 5) : s;
    }

    setValue(newValue: number) {
        if (this.validate(newValue)) {
            this.$emit("input", newValue);
        }
    }

    @Watch("tempValue")
    resetInvalid() {
        this.invalid = false;
    }

    async enterEditMode() {
        this.tempValue = this.v.toFixed(3);
        this.editMode = true;
        await this.$nextTick();
        (this.$refs.input as HTMLElement).focus();
    }

    leaveEditMode() {
        const v = parseFloat(this.tempValue);
        if (!this.validate(v)) {
            this.invalid = true;
        } else {
            this.$emit("input", v);
            this.editMode = false;
        }
    }

    validate(v: number) {
        if (Number.isNaN(v)) {
            return false;
        } else if (typeof this.option.min === "number" && v < this.option.min) {
            return false;
        } else if (typeof this.option.max === "number" && v > this.option.max) {
            return false;
        } else {
            return true;
        }
    }
}
