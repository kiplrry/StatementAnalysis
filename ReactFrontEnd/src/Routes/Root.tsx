import UploadForm from "../components/UploadForm"
import { useDataTableStore } from "../components/storage"
import DataView from "../components/DataView"
import { useEffect, useState } from "react"
import { Nav } from "../components/Nav"
import Footer from "../components/Footer"

const Root = () => {
  const {currentTable, getCurrentTableId, tables, getTable} = useDataTableStore()
  const [data, setData] = useState<Record<string, unknown> | null>();

  useEffect(()=>{
    const id = getCurrentTableId()
    const _table = getTable(id)
    const tabledata = _table?.tableData || null;
    console.log(tabledata)
    setData(tabledata)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tables, currentTable])
  
  return (
    <div className="flex flex-col bg-stone-100 min-w-[100vw] min-h-[100vh] ">
        <Nav />
        <div className="max-w-[100%] flex flex-col flex-grow items-center justify-center pt-4 lg:px-8 px-3 ">
        {data && <DataView dataset={data}/>}
        {(tables && !tables.length) && <div className="w-full bg border-2 border-dotted rounded-lg h-[300px] flex flex-col items-center justify-center">
        <div className="w-[50%]">
          <span className="block text-3xl text-center">No Statement Available</span>
          <span className="block text-xl text-center mb-4">Upload an Mpesa Statement</span>
          <UploadForm/>
        </div>
        </div>}
        </div>
          <Footer></Footer>
    </div>
  )
}




export default Root