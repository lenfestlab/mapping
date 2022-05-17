import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export type Data = [
  {
    [topic: string]: string | number
  }
]

interface DataKey {
  dataKey: string
  fill: string
}
export type DataKeys = DataKey[]

interface Props {
  data: any
  dataKeys: any
}
export const TopicSummary = ({ data, dataKeys, ...props }: Props) =>
  <BarChart
    width={900}
    height={300}
    data={data}
    margin={{
      top: 5,
      right: 30,
      left: 20,
      bottom: 5,
    }} >
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    {dataKeys.map((dataKey: DataKey) => {
      return <Bar {...dataKey} />
    })}
    {/* <Bar dataKey="sports" fill="#F7464A" />
    <Bar dataKey="food" fill="#46BFBD" />
    <Bar dataKey="business" fill="#FEB45C" /> */}
  </BarChart>
