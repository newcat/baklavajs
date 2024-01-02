import type { Ref } from "vue";

export interface IMenuItem {
    label?: string;
    value?: any;
    isDivider?: boolean;
    submenu?: IMenuItem[];
    disabled?: boolean | Readonly<Ref<boolean>>;
}
