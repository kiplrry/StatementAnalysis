import { getData } from "./utils/utils";
import { useEffect,useMemo, useRef, useState} from "react";
import { Calendar } from "primereact/calendar";
import { Chart as chartjs} from 'chart.js/auto'
import { LineElement } from "chart.js/auto";
import Zoom from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";
import { aggregate, chartData, Timeline } from "./chartFunction";
import { Dropdown } from "primereact/dropdown";
import 'chartjs-adapter-date-fns';
import { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";

chartjs.register(LineElement)
chartjs.register(Zoom)

const zoomOptions: ZoomPluginOptions = {
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true, 
    },
    mode: 'x',
  },
  pan: {
    enabled: true,
    mode: 'x',
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LineChart = ({dataset}: {dataset: Record<string, any>}) => {
  const start = useRef<Date | undefined | null>()
  const end = useRef<Date | undefined | null>()
  const [period, setPeriod] = useState<Timeline>('daily')
  const [render, setRender] = useState(false)
  const statementPeriod = dataset.details[3]['value'].split('-');
  console.log({statementPeriod})
  useEffect(()=>{
    if((start && end) && (start > end)){
      end.current = start.current
      start.current = end.current
    }
  }, [start, end])

  useEffect(()=>{
    end.current = new Date(statementPeriod[1])
    start.current = new Date(statementPeriod[0])
    setRender(!render)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const periodOpts = ['daily', 'monthly', 'yearly']
  const data = useMemo(()=> {
    let _data = getData(dataset?.data, start.current, end.current)
    _data = aggregate(_data, period) || []
    return(_data)
  }, [period, start, end, dataset]) 
  console.log({start, end})

  return (
    <div className="flex flex-col items-center  rounded-md shadow-sm bg-white w-full">
      <span className="block  text-black lg:text-2xl  text-xl text-start w-full">Totals</span>
    <div className="flex mb-3  gap-3 items-center justify-around">
    <div className="flex justify-between border w-full">
      <Calendar value={start.current} onChange={(e) => {start.current = e.value}} selectionMode="single" readOnlyInput />
      <Calendar value={end.current} onChange={(e) => {end.current = e.value}} selectionMode="single" readOnlyInput />
      <Dropdown value={period} placeholder="Select a period" onChange={(e) => setPeriod(e.value)}
      defaultValue={periodOpts[0]}
      options={periodOpts}/>
    </div>
    </div>
    <Line data={chartData(data)}
    className="border h-full"
    options={{
      plugins: {
        zoom: zoomOptions
      },
      elements: {
        line : {
          tension: 0
        },
        point : {
          pointStyle: 'circle'
        }
      },
      
      scales: {
        x : {
          type: 'timeseries',
          time: {
            unit: period == 'monthly' ? 'month' :
              period == 'daily' ? 'day' : 'year'
          }

        }
      }
    }}/>
    </div>
  )
}