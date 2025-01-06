import { create } from "zustand";
import { persist } from "zustand/middleware";


export interface Table{
    id: string,
    tableData?: Record<string, unknown>,
    taskId: string,
    date: Date
}

interface DataTableStore {
    tables: Table[];
    getTableIds: () => string[];
    currentTable: string;
    setCurrentTable: (id: string) => void;
    getTable: (id?: string, taskId?: string) => Table | null;
    getTables: () => Table[];
    getCurrentTableId: () => string,
    setTable: (tableData: Record<string, unknown>, taskId: string, id: string) => void;
    removeTable: (id: string) => void;
    clearTables: () => void,
    getEmptyTables: () => Table[]
  }

export const useDataTableStore = create<DataTableStore>()(
    persist(
        (set, get)=>({
            tables: [],
            currentTable: '',
            getTableIds : () =>  get().tables.map(table => table.id),
            getCurrentTableId: () => {
                const current = get().currentTable 
                if(get().getTableIds().includes(current)) return current
                const tableId = get()?.tables[0]?.id || ''
                set(() => ({currentTable: tableId}))
                return tableId
            },
            setCurrentTable: (id: string) => 
                set(() => {
                    const tableIds = get().getTableIds();
                    return { currentTable: tableIds.includes(id) ? id : tableIds[0] || '' };
                }),
            getTable: (id?: string, taskId?: string) => {
                if(taskId) return get().tables.find((table)=> table.taskId == taskId) || null
                const tableId = id
                return get().tables.find((table) => table.id === tableId) || null;
            }, 

            getTables: () => get().tables,

            setTable: (tableData: Record<string, unknown>, taskId: string, id: string)=>{
                set((state) => {
                const _table = state.tables.filter(table => table.taskId === taskId)
                if(_table.length){
                    const tables = state.tables.map(table => {
                        if(table.taskId == taskId){
                            table.tableData = tableData
                        }
                        return table
                    })
                    return {tables}
                }
                return ({
                    tables: [...state.tables, {id, tableData, taskId, date: new Date()}]
                })})
            },
            removeTable: (id: string) => set((state) => {
                return ({
                    tables: state.tables.filter(table => table.id !== id)
                })}),
            clearTables: () => set(() => ({tables: [], currentTable: ''})),
            
            getEmptyTables: () => get().tables.filter(table => (!table.tableData && table.taskId))
        }),
        {
            name: 'data-table-storage'
        }
    )

)