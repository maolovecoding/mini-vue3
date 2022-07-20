import { parse } from "../parse";
export interface ITransformContext {
  currentNode: ReturnType<typeof parse>;
  parent: ReturnType<typeof parse>;
  helpers: Map<any, any>;
  helper: (name) => any;
  removeHelper: (name) => any;
  nodeTransforms: any[];
}
