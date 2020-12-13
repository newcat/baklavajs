import { BaseNumericOption } from "../baseNumericOption";
import SliderOptionComponent from "./SliderOption.vue";

export class SliderOption extends BaseNumericOption {
    component = SliderOptionComponent;
    min: number;
    max: number;

    constructor(name: string, value: number, min = 0, max = 1) {
        super(name, value, min, max);
        this.min = min;
        this.max = max;
    }
}
