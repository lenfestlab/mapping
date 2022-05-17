import { h } from "@cycle/react";
import { div } from "@cycle/react-dom";
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  TextField,
} from "@mui/material"
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { classNames } from "./style";
import { px } from "csx";
import { DateRange } from "..";
import { isValid } from "date-fns";
import { find } from "lodash";

interface Props {
  options: any
  defaultOption: string
  onChangeZip: (zip: string) => void
  dateRange: DateRange
  onChangeDateRange: (dateRange: DateRange) => void
}
export const SearchForm =  ({
  options,
  defaultOption,
  onChangeZip,
  dateRange,
  onChangeDateRange
}: Props) => {
  const { start, end } = dateRange

  const onChangeStart = (date: any) => {
    if (isValid(date)) {
      onChangeDateRange({ start: date, end })
    } else {
      console.error("invalid start date")
    }
  }
  const onChangeEnd = (date: any) => {
    if (isValid(date)) {
      onChangeDateRange({ start, end: date })
    } else {
      console.error("invalid end date")
    }
  }

  const defaultValue = find(options, ({ id }) => id === defaultOption)
  return h(LocalizationProvider, { dateAdapter: AdapterDateFns }, [
    div({ className: classNames.row }, [
      h(Autocomplete, {
        fullWidth: true,
        id: "free-solo",
        freeSolo: true,
        options,
        defaultValue,
        onInputChange: (event, newInputValue) => {
          if (!!newInputValue) onChangeZip(newInputValue)
        },
        renderInput: (params: AutocompleteRenderInputParams) => {
          return h(TextField, {
            ...params,
            label: "Zip",
          })
        }
      }),
    ]),
    div({className: classNames.row, style: { paddingBottom: px(10) } }, [
      h(DatePicker, {
        label: "Start date",
        value: start,
        onChange: onChangeStart,
        renderInput: (params: any) => h( TextField, { ...params })
      }),
      h(DatePicker, {
        label: "End date",
        value: end,
        onChange: onChangeEnd,
        renderInput: (params: any) => h( TextField, { ...params })
      }),
    ])
  ])
}
