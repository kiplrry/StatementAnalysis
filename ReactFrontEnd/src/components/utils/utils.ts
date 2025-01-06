/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterMatchMode, FilterService } from "primereact/api";


export const getFormattedData = (data: any[])=>{
    return [...data || []].map(d => {
      d['Completion Time'] = new Date(d['Completion Time']);
      return d;
  });
  }

export const getData = (data: any[], start?: Date | null, end?: Date | null) => {
    let _data = getFormattedData(data )  
    if(start) 
        _data = FilterService.filter(_data, ['Completion Time'],new Date(start), FilterMatchMode.DATE_AFTER)
    if(end)
        _data = FilterService.filter(_data, ['Completion Time'], new Date(end), FilterMatchMode.DATE_BEFORE)

    return _data
};

export const getDatePeriod = (data: any[])=> {
    let min = new Date()
    let max = new Date(-1)
    if(!data) return [min, max]
    data.map(trans => {
        if(!trans['Completion Time']) return
        const dataDate = new Date(trans['Completion Time'])
        if(dataDate > max) max = dataDate
        if(dataDate < min) min = dataDate
    })
    return [min, max]
}