import { markRaw } from "vue";
import { BaseNumericInterface } from "../baseNumericInterface";
import IntegerInterfaceComponent from "./IntegerInterface.vue";

export class IntegerInterface extends BaseNumericInterface {
    component = markRaw(IntegerInterfaceComponent);

    public validate(v: number) {
        return Number.isInteger(v) && super.validate(v);
    }
}

export { IntegerInterfaceComponent };
