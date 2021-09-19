import { markRaw } from "vue";
import { BaseNumericInterface } from "../baseNumericInterface";
import NumberInterfaceComponent from "./NumberInterface.vue";

export class NumberInterface extends BaseNumericInterface {
    component = markRaw(NumberInterfaceComponent);
}

export { NumberInterfaceComponent };
