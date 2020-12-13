import { IValidator, BaseNumericOption } from "../baseNumericOption";
import NumberOptionComponent from "./NumberOption.vue";

export class NumberOption extends BaseNumericOption implements IValidator {
    component = NumberOptionComponent;
}
