import { BaseNumericInterface } from "../baseNumericInterface";
import SliderInterfaceComponent from "./SliderInterface.vue";

export class SliderInterface extends BaseNumericInterface {
    component = SliderInterfaceComponent;
    min: number;
    max: number;

    constructor(name: string, value: number, min = 0, max = 1) {
        super(name, value, min, max);
        this.min = min;
        this.max = max;
    }
}

export { SliderInterfaceComponent };
