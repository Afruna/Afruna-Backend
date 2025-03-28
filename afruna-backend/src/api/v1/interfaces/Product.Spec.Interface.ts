export interface ProductSpecInterface {
    name: string;
    label: string;
    inputType: InputType;
    metadata: Array<Record<string, string | number>>;
}

export enum InputType {
    TEXT = "text",
    SELECT = "select",
    RADIO = "radio",
    TEXTAREA = "textarea"
 }