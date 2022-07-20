export const TO_DISPLAY_STRING = Symbol("toDisplayString");
export const CREATE_TEXT = Symbol("createTextVnode");
export const CREATE_ELEMENT_VNODE = Symbol("createElementVnode");
export const OPEN_BLOCK = Symbol("openBlock");
export const CREATE_ELEMENT_BLOCK = Symbol("createElementBlock");
export const FRAGMENT = Symbol("fragment");
export const helperMap = {
  [TO_DISPLAY_STRING]: TO_DISPLAY_STRING.description,
  [CREATE_TEXT]: TO_DISPLAY_STRING.description,
  [CREATE_ELEMENT_VNODE]: CREATE_ELEMENT_VNODE.description,
  [OPEN_BLOCK]: OPEN_BLOCK.description,
  [CREATE_ELEMENT_BLOCK]: CREATE_ELEMENT_BLOCK.description,
  [FRAGMENT]: FRAGMENT.description,
};
