import { useState } from "react";
import { b, div, h1, i, span } from '@cycle/react-dom';
import { h } from "@cycle/react";
import { normalize, setupPage } from "csstips";
import { cssRule, cssRaw } from "typestyle";
import { px } from "csx";
import Frame from "react-iframe";
import { format } from "date-fns";
import { useAsync } from "react-use";
import { concat, flatten, get, lowerCase, omit, round, sortBy, startCase, takeRight, uniq, without } from "lodash";
import { Typography } from "@mui/material"

import { classNames } from "./style"
import { SearchForm} from "./SearchForm"
import { StatsView } from "./StatsView"
import { CountData } from "./StatsView/CountChart"
import { ArticleList } from "./ArticleList"

import coverageGeoJson from "./data/coverageArea.geojson.json"
import countyGeoJson from "./data/countyData.geojson.json"
import zipGeojson from "./data/zctaData.geojson.json"
const seedColor = require('seed-color');

normalize()
setupPage("#root")
cssRule("html, body", {
  height: "100%",
  width: "100%",
  padding: 0,
  margin: 0,
})
cssRaw(`
@import url('https://fonts.googleapis.com/css?family=Roboto|Roboto+Slab&display=swap');
`)


export const formatDate = (date: Date) => format(date, 'yyyy/MM/dd')

export interface DateRange {
  start: Date
  end: Date
}

interface StoryCountsPayload {
  zip_codes: {
    [zip: string]: {
      [section: string]: number
    }
  },
  counties: {
    [geoid: string]: {
      [section: string]: number
    }
  }
}

const coverageData = coverageGeoJson.features[0]!.properties
const coverageAreaName = "Inquirer Coverage Area"

const countyMap = new Map()
countyGeoJson.features.forEach(({ properties }) => countyMap.set(properties.GEOID, properties))

const zipMap = new Map()
zipGeojson.features.forEach(({ properties }) => zipMap.set(properties.GEOID, properties))
const zips = Array.from(zipMap.keys())
const defaultZip = "19107"

const zipToNabeNames = zips.reduce((map: Map<string, string | null>, zip: string, idx: number, zips: string[]) => {
  const zipProps = zipMap.get(zip)
  let nabeList = get(zipProps, "NeighborhoodList")
  if (nabeList === "nan") {
    nabeList = null
  } else {
    nabeList = nabeList.split(",").map((name: string) => startCase(lowerCase(name))).join(", ")
  }
  map.set(zip, nabeList)
  return map
}, new Map())

const zipToNames = zips.reduce((map: Map<string, string | null>, zip: string, idx: number, zips: string[]) => {
  let value = zip
  const zipProps = zipMap.get(zip)
  let nabeList = zipToNabeNames.get(zip)
  if (nabeList) {
    value += ` (${nabeList})`
  }
  const countyNames = get(zipProps, "Counties")
  if (countyNames) {
    value += ` - ${countyNames}`
  }
  map.set(zip, value)
  return map
}, new Map())

const zipOptions = zips.map(zip => {
  const nameList = zipToNames.get(zip)
  const label = nameList === null ? zip : nameList
  return {
    label,
    id: zip
  }
})

const App = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(2021, 0, 1),
    end: (new Date(2022, 2, 15))
  })

  const [zip, setZip] = useState<string>(defaultZip)

  const zipData = zipMap.get(zip)

  const countiesGEOIDs: string[] = zipData["GEOIDs"]!.split(",")

  const { start, end } = dateRange
  const { loading, value, error } = useAsync(async () => {
    const url = `https://lenfest-mapping.herokuapp.com/collections/13/info.json?after=${formatDate(start)}&before=${formatDate(end)}`
    const requestURL = url
    const response = await fetch(requestURL)
    const payload: StoryCountsPayload = await response.json()
    return payload
  }, [zip, start, end])
  if (error) { console.error(error) }

  const zipTopicCounts = get(value, ["zip_codes", zip], null)
  const coverageAreaTopicCounts = get(value, "coverage_area", null)

  const zipPopulation = zipData["TotalPopulation"]
  const countiesPopulations = countiesGEOIDs.reduce((map: Map<string, number>, geoid: string, idx: number) => {
    const countyData = countyMap.get(geoid)
    const population = countyData["TotalPopulation"]
    map.set(geoid, population)
    return map
  }, new Map())
  const coveragePopulation = coverageData["TotalPopulation"]


  const getCountyName = (geoid: string) => {
    const localMap = countyMap.get(geoid)
    return get(localMap, "NAMELSAD")
  }
  const perCapita = (count: number | null | undefined, population: number | null | undefined, label: string | null) => {
    console.debug(`${label}: count ${count} / population ${population}`)
    if (count && population) {
      return round(count / (population / 1000), 1)
    } else {
      return 0
    }
  }

  console.debug("Story Counts")
  const countiesTopicData = countiesGEOIDs.map(geoid => {
    return {
      name: getCountyName(geoid),
      count: perCapita(get(value, ["counties", geoid, "total"], 0), countiesPopulations.get(geoid), `county ${geoid}`)
    }
  })
  const countData: CountData = [
    {
      name: zip,
      count: perCapita(get(zipTopicCounts, 'total'), zipPopulation, "zip")
    },
    ...countiesTopicData,
    {
      name: coverageAreaName,
      count: perCapita(get(coverageAreaTopicCounts, "total"), coveragePopulation, "coverage")
    },
  ]

  const selectTop = (obj: Object, population: number, label: string | null): Object => {
    const sansTotal = omit(obj, ['total'])
    const list: Object[] = []
    Object.keys(sansTotal).map((key, index) => {
      // @ts-ignore
      const count: number = obj[key]
      list.push({ topic: key, count })
    });
    // order by count
    const sorted = sortBy(list, 'count')
    const top = takeRight(sorted, 3)
    const topObj = {}
    top.forEach((topicObj, idx, all) => {
      // @ts-ignore
      topObj[topicObj["topic"]] = perCapita(
        // @ts-ignore
        topicObj["count"],
        population,
        label
      )
    })
    return topObj
  }

  console.debug("Top 3")

  let zipTopTopics = {}
  if (zipTopicCounts) {
    // @ts-ignore
    zipTopTopics = selectTop(zipTopicCounts, zipPopulation, `zip: ${zip}`)
  }

  const countiesTopTopics = countiesGEOIDs.map(geoid => {
    return {
      name: getCountyName(geoid),
      ...selectTop(
       // @ts-ignore
        get(value, ["counties", geoid]),
        countiesPopulations.get(geoid),
        `county ${geoid}`
      )
    }
  })

  const coverageTopicCounts = get(value, "coverage_area")
  let coverageTopTopics = {}
  if (coverageTopicCounts) {
    coverageTopTopics = selectTop(coverageTopicCounts, coveragePopulation, "coverage")
  }

  const allTopics = without(uniq(flatten(concat(
    Object.keys(zipTopTopics),
    Object.keys(coverageTopTopics),
    // @ts-ignore
    flatten(countiesTopTopics.map(topics => Object.keys(topics)))
    ))), "name")

  let dataKeys: any[] = []
  allTopics.forEach(topicName => {
    dataKeys.push({
      key: topicName,
      dataKey: topicName,
      fill: seedColor(topicName).toHex()
    })
  })

  const topicData: any = [
    {
      name: zip,
      ...zipTopTopics
    },
    ...countiesTopTopics,
    {
      name: coverageAreaName,
      ...coverageTopTopics
    }
  ]

  const getCountyStats: any = (statKey: string) => {
    // @ts-ignore
    return countiesGEOIDs.reduce((obj, geoid) => {
      const countyName = getCountyName(geoid)
      // @ts-ignore
      obj[countyName] = get(countyMap.get(geoid), statKey)
      return obj
    }, {})
  }

  const summaryData = {
    population: {
      [zip]: zipData["TotalPopulation"],
      ...getCountyStats("TotalPopulation"),
      [coverageAreaName]: coverageData["TotalPopulation"],
    },
    median_household_income: {
      [zip]: zipData["MedianHouseholdIncome"],
      ...getCountyStats("MedianHouseholdIncome"),
      [coverageAreaName]: {
        min: coverageData["MhiMin"],
        max: coverageData["MhiMax"]
      }
    },
    below_poverty_line: {
      [zip]: zipData["percentInPoverty"],
      ...getCountyStats("percentInPoverty"),
      [coverageAreaName]: coverageData["percentInPoverty"],
    },
    education: {
      [zip]: zipData["NoDiplomaPerc"],
      ...getCountyStats("NoDiplomaPerc"),
      [coverageAreaName]: coverageData["NoDiplomaPerc"],
    },
    gini: {
      [zip]: zipData["GiniIndex"],
      ...getCountyStats("GiniIndex"),
      [coverageAreaName]: {
        min: coverageData["GiniMin"],
        max: coverageData["GiniMax"]
      }
    },
  }

  const nabeList = zipToNabeNames.get(zip)

  const onChangeZip = (newValue: string) => {
    const newZip = newValue.split(/[ ,]+/)[0]
    if (zips.includes(newZip)) {
      setZip(newZip)
    }
  }
  const onChangeDateRange = (range: DateRange) => {
    setDateRange(range)
  }
  return div({ className: classNames.background }, [
    div({ className: classNames.main }, [
      h(Typography, { variant: "h6"}, [
        `Local News Mapping Tool: Philadelphia Inquirer Coverage (Jan. 1, 2021 - March 15, 2022)`
      ]),
      h(Typography, { variant: "subtitle1", gutterBottom: true }, [
        i(`Developed by the Lenfest Local Lab and the Brown Institute`)
      ]),
      h(SearchForm, {
        options: zipOptions,
        defaultOption: defaultZip,
        onChangeZip,
        dateRange,
        onChangeDateRange,
      }),
      h(Frame, {
        url: `https://coverage-analysis.herokuapp.com/visualize/zctaData/${zip}?after=${formatDate(start)}&before=${formatDate(end)}`,
        // width: "100%",
        width: "900px",
        height: "450px",
        scrolling: "no",
        frameBorder: 0,
        styles: {
          paddingTop: px(20),
        }
      }),
      nabeList && span({
        style: {
          fontSize: "12px",
           paddingTop: px(10),
           paddingBottom: px(20)
          }
        }, [
          b("Corresponding Neighborhoods to this Zip Code: "),
         nabeList
      ]),
      // @ts-ignore
      h(StatsView, { countData, topicData, dataKeys, summaryData, style: { paddingTop: px(10) } }),
      h(ArticleList, { zip, dateRange }),
    ])
  ])
}

export default App;
