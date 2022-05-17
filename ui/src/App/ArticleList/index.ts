import { a, i  } from "@cycle/react-dom";
import { useAsync } from "react-use";
import { Stack, List, ListItem, Card, Typography, TablePagination } from "@mui/material";
import { h } from "@cycle/react";
import { useState } from "react";

import type { DateRange } from "./.."
import { formatDate } from "./..";
import { Box } from "@mui/system";

interface Article {
  identifier: string
  title: string
  source_url: string
  info: {
    "source.name": string
  }
}
type Payload = {
  articles: Article[]
  meta: {
    count: number
  }
}

interface Props {
  zip: string
  dateRange: DateRange
}
export const ArticleList = ({ zip, dateRange: { start, end }, ...props }: Props) => {
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [page, setPage] = useState<number>(0)

  const { loading, value, error } = useAsync(async () => {
    const url = `https://lenfest-mapping.herokuapp.com/collections/13/simple_articles.json?bind=true&page=${(page + 1)}&per_page=${rowsPerPage}&zipcode=${zip}&after=${formatDate(start)}&before=${formatDate(end)}`
    const requestURL = url
    const response = await fetch(requestURL)
    const payload: Payload = await response.json()
    return payload
  }, [zip, start, end, page, rowsPerPage])
  if (error) { console.error(error) }

  const articles = value?.articles ?? []
  const count = value?.meta?.count ?? 0

  const onRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const rows = parseInt(event.target.value, 10)
    console.debug("rows", rows)
    setRowsPerPage(rows)
    setPage(0)
  }

  return h(Card, {}, [
    h(Stack, {}, [
      h(Box, {padding: "18px", paddingBottom: 0}, [
        h(Typography, { fontWeight: 700  }, [
          `Stories that mention locations within the ${zip} zip code`,
        ]),
        h(Typography, { gutterBottom: true, variant: "body2" }, [
          i(`Note: This list of stories matches up to the stories plotted as dots on the map at the top of this page, but displays them here in an easier to read format.`)
        ]),
      ]),
      h(List, { }, [
        ...articles.map((article: Article, idx: number, articles) => {
          const { identifier, title, source_url } = article
          return h(ListItem, {}, [
            a({ key: identifier, href: source_url, target: "_blank" }, title)
          ])
        })
      ]),
      h(TablePagination, {
        count,
        page,
        onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
          setPage(newPage)
        },
        rowsPerPage,
        onRowsPerPageChange,
      }),

    ]),
  ])
}
