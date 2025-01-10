/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartData } from "chart.js";


export type Timeline = "yearly" | "monthly" | "daily" 

export const chartData= (data: Record<string, any>[], ): ChartData<"line", any[], any>=> {
    return {
    labels: data.map(dat => new Date(dat['Completion Time'])),
    datasets : [
      {
        label: 'Balance',
        data: data.map(d => d.Balance),
        borderColor: 'blue',
        // hidden: true
      },
      {
        label: 'Withdrawn',
        data: data.map(d => Math.abs((d['Withdrawn']))),
        borderColor: 'red'
      },
      {
        label: 'Paid In',
        data: data.map(d => Math.abs(d['Paid In'])),
        borderColor: 'green'
      }
    ]
  }
}
export function aggregateMonthly(data: Record<string, any>[]) {
    const _data = Object.values(data.reduce((acc, item) => {
      const monthYear = new Date(item["Completion Time"]).toISOString().slice(0, 7); // format: "YYYY-MM"
      if (!acc[monthYear]) acc[monthYear] = { "Completion Time": monthYear, Withdrawn: 0, 'Balance': 0,"Paid In": 0, count: 0 };
      acc[monthYear].Withdrawn += Number(item.Withdrawn) || 0;
      acc[monthYear]['Paid In'] += Number(item['Paid In']) || 0;
      acc[monthYear]['Balance'] += Number(item['Balance']) || 0;
      acc[monthYear].count += 1;
      return acc;
    }, {}))
    .map(grp => ({...grp, Balance: parseFloat((grp['Balance']/grp['count']).toFixed(2))}))
    // console.log(_data)
    return _data
  }

export function aggregateYearly(data: Record<string, any>[]) {
    if(!data) return []
    const _data =  data.reduce((acc, item) => {
      const year = new Date(item["Completion Time"]).getFullYear();
      if (!acc[year]) acc[year] = {"Completion Time": String(year), Withdrawn: 0, 'Paid In': 0, count: 0 };
      acc[year].Withdrawn += Number(item.Withdrawn) || 0;
      acc[year]['Paid In'] += Number(item['Paid In']) || 0;
      acc[year].count += 1;
      return acc;
    }, {});
    return Object.values(_data)
  }
export function aggregateDaily(data: Record<string, any>[]) {
    if(!data) return []
    const _data =  data.reduce((acc, item) => {
      const date = new Date(item["Completion Time"]).toISOString().slice(0, 10);
      if (!acc[date]) acc[date] = {"Completion Time": String(date), Withdrawn: 0, 'Paid In': 0, count: 0 };
      acc[date].Withdrawn += Number(item.Withdrawn) || 0;
      acc[date]['Paid In'] += Number(item['Paid In']) || 0;
      acc[date].count += 1;
      return acc;
    }, {});
    return Object.values(_data)
  }
export function aggregate(data: Record<string, any>[], period: Timeline ){
    if(!data) return []
    let _data;
    if(period == 'monthly') {
        _data = aggregateMonthly(data)
    }
    if(period == 'yearly' ){
        _data = aggregateYearly(data)
    }
    if(period == 'daily') _data = aggregateDaily(data)
    
    _data = _data?.sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return new Date(a['Completion Time']) - new Date(b['Completion Time'])  
    })
    return _data
}


export function groupByType(data: Record<string, any>[] ) {
  if(!data) return []
  return data.reduce((result, item) => {
    let type = item.Type
    if(type == '') type = 'Empty Group'
    if (!result[type]) {
      result[type] = [];
    }
    result[type].push(item);
    return result;
  }, {});
}

export function aggregateGroup(group: Record<string, Record<string, unknown>[]>) {
  if(!group) return []
  
}

export function getFuliza(data: Record<string, any>[] ) {
  if (!data || data.length === 0) return {fuliza: []};
  const words = ['fuliza', 'credit party']
  const fuliza = data.filter((item) => 
    words.some((word) => item.Type.toLowerCase().includes(word))
  );
  return { fuliza }
}
