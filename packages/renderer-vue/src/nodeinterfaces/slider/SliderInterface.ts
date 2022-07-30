import { type ComponentOptions, markRaw } from "vue";
import { BaseNumericInterface } from "../baseNumericInterface";
import SliderInterfaceComponent from "./SliderInterface.vue";

export class SliderInterface extends BaseNumericInterface {
    component = markRaw(SliderInterfaceComponent) as ComponentOptions;
    min: number;
    max: number;

    constructor(name: string, value: number, min: number, max: number) {
        super(name, value, min, max);
        this.min = min;
        this.max = max;
    }
}

export { SliderInterfaceComponent };
