/* eslint-disable @typescript-eslint/no-explicit-any */
import { LineChart } from './LineChart'
import BarChartData from './BarChartData'
import { Table } from './Table'
import SummaryChart from './SummaryChart'
import { DataTable, DataTableValueArray } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Accordion, AccordionTab } from 'primereact/accordion';
import FulizaChart from './FulizaChart'
        
interface CardProps {
    title: string,
    period: Date[],
    amount: string,
    sentiment: string
  }
  
function DataView({dataset}: {dataset: Record<string, any>}) {
  const data = dataset.data
  return (
    <div className='max-w-[100%] w-full'>
    <Accordion activeIndex={0} className='min-w-full border'>
      <AccordionTab header='Details'>
        <div className="max-w-full grid lg:grid-cols-2 grid-cols-1 gap-3">
          <DetailsCard tableData={dataset}/>
          <SummaryCard tableData={dataset}/>
        </div>
      </AccordionTab>
      <AccordionTab header='Summary Bar Charts'>
        <div className="max-w-full gap-y-3 grid mt-3 lg:grid-cols-2 grid-cols-1">
          <BarChartData dataset={data}/>
          <SummaryChart dataset={data} title='Quick Summary of Grouped Data'/>
          <FulizaChart dataset={data} title='Fuliza'/>
        </div>
      </AccordionTab>
      <AccordionTab header='Trend Chart'>
          <div className="mt-2">
            <LineChart dataset={dataset}/>
          </div>
      </AccordionTab>
    </Accordion>
      <Table dataset={data}/>
    </div>
  )
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Card = ({title, period, amount}: CardProps) => {
    return (
      <div className="flex flex-col grow justify-between bg-white min-w-[200px] min-h-[150px] rounded-xl w-fit py-3 px-10">
        <div className="flex space-x-4 items-center" >
          <div className="">
            <span className="text-xl block">{title}</span>
            <span className="text-sm font-light text-gray-500">{period[0].toDateString()} - {period[1].toDateString()}</span>
          </div>
          <div className=" p-2 aspect-square rounded-lg">
            <i className="pi pi-arrow-up text-red-700" style={{ fontSize: '1rem' }}></i>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="">
            <span className="text-xl font-bold tracking-widest  block">{amount.toUpperCase()}</span>
            <span className="block text-sm text-green-600">+ 16% Last Year</span>
          </div>
            <i className="pi pi-chart-line text-blue-500 text-4xl"></i>
        </div>
      </div>
    )
  }


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SummaryCard = ({tableData}: {tableData: Record<string, any>})=>{
  const summary: DataTableValueArray = tableData.summary

  return (
    <div className='h-full'>
      {/* <span>ss {summary}</span> */}
      <DataTable value={summary} stripedRows>
          <Column field='TRANSACTION TYPE' header='TRANSACTION TYPE' />
          <Column field='PAID IN' header='PAID IN'/>
          <Column field='PAID OUT' header='PAID OUT'/>
      </DataTable>
    </div>
  )
}

const DetailsCard = ({tableData}: {tableData: Record<string, any>})=>{
  const details = tableData.details
  // const [code] = useState(Object.values(tableData['code'][0]))

  const Body = (data: {data: Record<string, any>})=>{
    return (
      <div >{data.value}</div>
    )
  }
  return (
    <div className='w-full bg-white rounded-md flex h-full'>
      <DataTable value={details} className='w-full' style={{height: '100%'}}>
        <Column  field='detail' header={'Details'} />
        <Column  field='value' body={Body}/>
      </DataTable>
    </div>
  )
}
export default DataView