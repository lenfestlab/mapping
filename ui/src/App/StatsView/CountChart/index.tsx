import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

type Datum = {
  name: string
  count: number | null | undefined
}
export type CountData = Datum[]

interface Props {
  data: CountData
}
export const CountChart = ({data, ...prop}: Props) =>
    <BarChart
      width={900}
      height={300}
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      {/* <Legend /> */}
      <Bar dataKey="count" fill="#268DCE" />
    </BarChart>
