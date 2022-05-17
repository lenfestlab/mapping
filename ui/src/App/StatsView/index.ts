import { h } from "@cycle/react";
import { br, div, i } from "@cycle/react-dom";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material'
import { CountChart, CountData } from "./CountChart";
import { StatsSummary, SummaryData } from "./StatsSummary";
import { TopicSummary, Data as TopicData } from "./TopicSummary";

interface SectionProps {
  label: string
  sublabel?: string
  children?: React.ReactNode
}
const AccordionSection = ({ label, sublabel, children }: SectionProps) =>
  h(Accordion, {
    disableGutters: true,
    defaultExpanded: true,
    children: [
      h(AccordionSummary, {
        expandIcon: h(ExpandMore),
      }, [
        h(Typography, { fontWeight: 700 }, label),
      ]),
      h(AccordionDetails, {}, [
        sublabel && h(Typography, { variant: "body2", gutterBottom: true, style: { fontStyle: "italic"} }, [
          sublabel
        ]),
        br(),
        children
      ])
    ]
  })

export interface Props {
  countData: CountData
  topicData: TopicData
  dataKeys: any
  summaryData: SummaryData
  style: any
}
export const StatsView = ({
  countData,
  topicData,
  dataKeys,
  summaryData, style }: Props) => {
  return div({ style }, [
    h(AccordionSection, {
      label: "Stories per 1,000 people",
      sublabel: `This divides the number of stories that mention an area by the population of that area and multiples by one thousand. The Inquirer Coverage Area includes these counties: Bucks, Chester, Delaware, Montgomery and Philadelphia Counties (PA); Burlington, Camden and Gloucester Counties (NJ).`
    }, [
      h(CountChart, { data: countData })
    ]),
    h(AccordionSection, {
      label: "Topic areas (Top 3)",
      sublabel: `This shows the top three topics of stories written about an area.`
     }, [
      h(TopicSummary, { data: topicData, dataKeys })
    ]),
    h(AccordionSection, {
      label: "Summary Census Statistics"
    }, [
      h(StatsSummary, { data: summaryData })
    ]),
  ])
}
