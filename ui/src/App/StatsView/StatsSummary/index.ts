import { h } from "@cycle/react"
import { br, div } from "@cycle/react-dom"
import { Stack, Divider } from "@mui/material"
import { pick } from "lodash"

type RangeDatum = { min: number, max: number}
type Datum = number | null

interface ResolutionData {
  zip: Datum
  county: Datum
  coverage_area?: Datum | RangeDatum
}

export interface SummaryData {
  population: ResolutionData
  median_household_income: ResolutionData
  below_poverty_line: ResolutionData
  gini: ResolutionData
  education: ResolutionData
}

interface Props {
  data: SummaryData
}
export const StatsSummary = ({ data }: Props) => {
  const formatResolutionKey = (key: string) => key.replace("_", " ")
  const formatFacetKey = (key: string) => {
    return {
     population: "Population:",
     median_household_income: "Median Household Income:",
     below_poverty_line: "Below Poverty Line:",
     gini: "GINI (inequality indicator):",
     education: "Education:"
    }[key]
  }
  const formatPercent = (value: number) => {
    const rounded = Math.round(value * 100)
    return `${rounded}%`
  }

  const formatFacetValue = (key: string, value: number) => {
    if (value === -666666666 || value === null) return "n/a"
    switch(key) {
      case "below_poverty_line":
        return formatPercent(value)
      case "education":
        return formatPercent(value)
      case "gini":
        if (typeof value === 'number') {
         return formatPercent(value)
        } else {
          const { min, max } = value
          return `${formatPercent(min)} - ${formatPercent(max)}`
        }
      case "median_household_income":
        if (typeof value === 'number') {
          return `$${value.toLocaleString("en-US")}`
        } else {
          const { min, max } = value
          // @ts-ignore
          return `$${min.toLocaleString("en-US")} - $${max.toLocaleString("en-US")}`
        }

      default:
        return value.toLocaleString("en-US")
    }
  }
  const makeNodes = (obj: Object): React.ReactNode[] => {
    let nodes: React.ReactNode[] = []
    for (const [facetKey, facetValue] of Object.entries(obj)) {
      nodes.push(div({style: {fontWeight: 500}},formatFacetKey(facetKey)))
      for (const [key, value] of Object.entries(facetValue)) {
        //@ts-ignore
        nodes.push(div({style: {fontWeight: 300}},`${formatFacetValue(facetKey, value)} (${formatResolutionKey(key)})`))
      }
      nodes.push(br())
    }
    return nodes
  }

  const left = pick(data, [
    "population",
    "median_household_income",
    "below_poverty_line"
  ])
  const leftNodes = makeNodes(left)

  const right = pick(data, [
    "education",
    "gini",
  ])
  const rightNodes = makeNodes(right)

  return div({style: {lineHeight: 1.7}}, [
    h(Stack, {
      direction:"row",
      spacing: 2,
      divider: h(Divider, {orientation:"vertical", flexItem: true}),
    }, [
      div([...leftNodes]),
      div([...rightNodes])
    ])
  ])
}
