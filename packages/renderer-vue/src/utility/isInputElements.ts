const INPUT_ELEMENT_TAGS = ["INPUT", "TEXTAREA", "SELECT"];

export function isInputElement(el: Element) {
    return INPUT_ELEMENT_TAGS.includes(el.tagName);
}
