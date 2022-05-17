import { stylesheet } from "typestyle";
import { px } from "csx";
import { horizontal } from "csstips"

export const classNames = stylesheet({
  row: {
    paddingTop: px(20),
    ...horizontal,
    rowGap: px(10),
    columnGap: px(10)
  },
})
