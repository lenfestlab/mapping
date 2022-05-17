import { stylesheet } from "typestyle";
import { fillParent, vertical } from "csstips"
import { px } from "csx";

export const classNames = stylesheet({
  background: {
    ...vertical,
    ...fillParent,
    alignItems: "center",
  },
  main: {
    paddingTop: px(50),
    width: px(900),
    ...vertical,
  },
})
