import type { PointerInput } from "../helpers";

export interface ProjectObjectProps {
  /** True while this project is the one shown on the stage. */
  active: boolean;
  input: PointerInput;
}
