import { Bar } from "react-chartjs-2"
import { ChartData } from "chart.js"
import { aggregate } from "./chartFunction"

const BarChartData = ({dataset}: {dataset: Record<string, string>}) =>{
  // const data = 
  const monthlydData = aggregate(dataset, 'monthly')
  const dataOptions: ChartData<"bar", (number | [number, number] | null)[], unknown> = {
    labels: monthlydData?.map(d => d["Completion Time"]),
    datasets: [
      {
        label: 'Withdrawn',
        data: monthlydData?.map(d => -d["Withdrawn"]) || [],
        backgroundColor: 'red',
      },
      {
        label: 'Paid In',
        data: monthlydData?.map(d => d["Paid In"]) || [],
        backgroundColor: 'blue',
      },
      {
        label: 'Average Balance',
        data: monthlydData?.map(d => d["Balance"]) || [],
        backgroundColor: 'green',
      }
    ],
  }

  return (
    <div className=" bg-white rounded-md grow flex-1 shadow-sm p-2 flex flex-col justify-between">
      <span className="block lg:text-xl text-black">Monthly Summary</span>
      <Bar data={dataOptions} className="max-w-full" />
    </div>
  )
}

export default BarChartData