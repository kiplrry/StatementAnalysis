import { useDataTableStore } from './storage'
import { DialogUploadForm } from './UploadForm'
import { Dialog } from 'primereact/dialog'
import { useRef, useState } from 'react'
import { Menu } from 'primereact/menu'
        
export const Nav = () => {
  const {currentTable, removeTable, getTableIds, setCurrentTable, getEmptyTables} = useDataTableStore()
  const [visible, setVisible] = useState(false)
  const handleDelete = (id: string)=>{
    if(confirm('do you want to delete this statement?')){
      removeTable(id)
      return true
    } 
  }

  // TODO create a refresh function for empty tables
  // const refresh = async() =>{
  //   const emptyTables = getEmptyTables()
  //   if(!emptyTables.length) return
  //   const ids = emptyTables.map((table)=> table.taskId)
  //   const datas = ids.map((id)=> await getFile())
  // }

  const StatementDialogBody = ()=>{

    const MenuOptions = ({id}: {id: string}) => {
      const menuRef = useRef<Menu>(null)
      const getItems = (id: string) => {
        return [{
          label: 'Analyse',
          icon: 'pi pi-search',
          command: () => {
            setCurrentTable(id)
            setVisible(false)
          }
        },
        {
          label:  'Delete',
          icon: 'pi pi-trash text-red-600',
          command: () =>{
            handleDelete(id)
          }
        }
      ]
      } 
      return (
        <div className="">
          <i className="pi pi-ellipsis-h" style={{ fontSize: '1rem' }} onClick={(event) => {menuRef.current?.toggle(event);}} aria-controls="popup_menu" aria-haspopup ></i>
          <Menu model={getItems(id)} ref={menuRef} popup  id="popup_menu_right" popupAlignment='right' />
        </div>
      )
    }
    return (
      <div className='w-full mt-2 border-none'>
        <div className="flex items-center justify-center">
          <span className="text-black p-2">Click to view statement</span>
        </div>
        <table className='w-full'>
        <tbody>
          {getTableIds().map((id)=>{
            return (
            <tr className='even:bg-gray-100 border border-y-gray-300 p-2'>
              <td onClick={()=>{setCurrentTable(id); setVisible(false)}} className='cursor-pointer p-2'>{id}</td>
              <td className='text-black px-2 py-2'>
                <MenuOptions id={id}/>
              </td>
            </tr>
            )
          })
          }
        </tbody>
        </table>
      </div>
    )
  }

  return (
    <nav className="bg-blue-600 max-w-[100%] lg:px-16 px-4 py-5 h-min-[100px]">
          <div className="flex gap-8 items-center text-white text-xl ">
            <span className="text-white font-bold lg:text-3xl  max-sm:text-2xl  font-mono">Statement Checker</span>
            <div className='flex gap-2 items-center underline'>
            <DialogUploadForm/>
            </div>
            <span onClick={()=> setVisible(true)} className='underline cursor-pointer'>Statements</span>
            <Dialog className='w-[80%]' visible={visible} header=' Available Statements' onHide={() => {if (!visible) return; setVisible(false); }} >
              <StatementDialogBody/>
            </Dialog>
          </div>
          <div className='text-white mt-4'>
            {currentTable && <> <span className='block'>You are Currently viewing: </span>
            <span className='block font-bold uppercase'>{currentTable}</span> </>}
            {!currentTable && <span className='block'>No table to view, upload a statement</span>}
          </div>
        </nav>
  )
}

