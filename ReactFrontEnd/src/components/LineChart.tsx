import { getData } from "./utils/utils";
import { useEffect,useMemo, useState} from "react";
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
  const [start, setStart] = useState<Date | undefined | null>()
  const [end, setEnd] = useState<Date | undefined | null>()
  const [period, setPeriod] = useState<Timeline>('daily')
  const statementPeriod = dataset.details[3]['value'].split('-');
  console.log({statementPeriod})
  useEffect(()=>{
    if((start && end) && (start > end)){
      setEnd(start)
      setStart(end)
    }
    console.log('ree')
  }, [start, end])

  useEffect(()=>{
    setEnd(new Date(statementPeriod[1]))
    setStart(new Date(statementPeriod[0]))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const periodOpts = ['daily', 'monthly', 'yearly']
  const data = useMemo(()=> {
    let _data = getData(dataset?.data, start, end)
    _data = aggregate(_data, period) || []
    return(_data)
  }, [period, start, end, dataset]) 
  console.log(data)

  return (
    <div className="flex flex-col items-center  rounded-md shadow-sm bg-white w-full">
      <span className="block  text-black lg:text-2xl  text-xl text-start w-full">Totals</span>
    <div className="flex mb-3  gap-3 items-center justify-around">
    <div className="flex justify-between gap-2 w-full">
      <Calendar value={start} onChange={(e) => {setStart(e.value)}} selectionMode="single" readOnlyInput />
      <Calendar value={end} onChange={(e) => {setEnd(e.value)}} selectionMode="single" readOnlyInput />
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