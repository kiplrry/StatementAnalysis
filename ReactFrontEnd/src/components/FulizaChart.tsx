import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import { aggregate, getFuliza } from "./chartFunction"
import { Dropdown } from 'primereact/dropdown';
import { ChartData } from "chart.js";
        

const FulizaChart = ({dataset, title}:{dataset: Record<string, unknown>[], title: string}) => {
    const grouped = getFuliza(dataset) || {}
    const [keys] = useState(()=>{
        return Object.keys(grouped)
    })
    const [selected, setSelected] = useState(keys[0])
    

    const [chartData, setChartData] = useState<ChartData<"bar", (number | [number, number] | null)[], unknown> | null>(null)
    
    useEffect(()=>{
        const selectedData = grouped[selected]
        const aggr = aggregate(selectedData, 'monthly')
        if(!aggr) throw Error('adsa')
        const _chartData = {
            labels: aggr.map(d => d["Completion Time"]),
            datasets: [
            {
                label: 'Withdrawn',
                data: aggr.map(d => -d["Withdrawn"]) || [],
                backgroundColor: 'red'
            },
            {
                label: 'Paid In',
                data: aggr.map(d => d["Paid In"]) || [],
                backgroundColor: 'blue'
            }
            ]}
        setChartData(_chartData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected])


    return (
        <div className="bg-white grow rounded-md col-span-2 flex p-2 max-w-full border">
            <div className="min-w-full ">
                <span className="lg:text-xl text-black">{title}</span>
                <div className="mt-2 w-full">
                {/* <Dropdown value={selected} onChange={(e) => setSelected(e.value)} options={keys} optionLabel="name" 
                placeholder="Select a transaction type" className="w-full md:w-14rem" />     */}
                    {chartData && <Bar data={chartData} className="" options={{
                        scales: {
                            x : {
                              type: 'timeseries',
                              time: {
                                unit: 'month'
                              }
                            }
                    }}}/>}
                </div>
                
            </div>
        </div>
    )
}

export default FulizaChart