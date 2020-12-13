import { BaseNumericOption } from "../baseNumericOption";
import IntegerOptionComponent from "./IntegerOption.vue";

export class IntegerOption extends BaseNumericOption {
    component = IntegerOptionComponent;

    public validate(v: number) {
        return Number.isInteger(v) && super.validate(v);
    }
}
