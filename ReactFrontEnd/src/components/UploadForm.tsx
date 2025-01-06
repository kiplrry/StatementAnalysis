import { Dialog } from "primereact/dialog"
import { FormEvent, useEffect, useRef, useState } from "react"
import { pollForFile, uploadFile } from "./axiosFns";
import { useDataTableStore } from "./storage";
import { Toast } from 'primereact/toast';
        

function UploadForm() {
    const toastRef = useRef<Toast>(null)
    const fileRef = useRef<HTMLInputElement | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const passRef = useRef<HTMLInputElement | null>(null)
    const [uploading, setUploading] = useState(0)
    const [pending, setPending] = useState<boolean | undefined>()
    const [, setresStatus] = useState<boolean | undefined>()
    const [errors, setErrors] = useState('')
    const {setTable} = useDataTableStore()
    const [controller, setController] = useState(new AbortController())

    useEffect(()=>{
        return () => {
            console.log('cancelled')
        }
    },[controller])
    
    const abort = () => {
        controller.abort()
        setController(new AbortController())
    }

    const showInfoToast = () => {
        toastRef.current?.show({ severity: 'info', detail: 'Upload was successfull!' });
    };
    const showSuccessToast = () => {
        toastRef.current?.show({ severity: 'success', summary:'Success', detail: 'Statement Analysed!' });
    };
    const showErrorToast = (error: string) => {
        toastRef.current?.show({ severity: 'error', summary: 'Error', detail: `${error.toString()}` });
    };
    const handleChange = ()=>{
        if(fileRef.current?.files){
            const _file = fileRef.current?.files[0] || null
            setFile(_file)
            console.log(_file)
        }   
    }

    const handleUpload = async (e: FormEvent)=>{
        e.preventDefault()
        setErrors('')
        if(!file) return
        if(passRef.current?.value) {
            const {data, err} = await uploadFile(file, passRef.current.value, setUploading, controller)
            if(err) showErrorToast(err as string)
            if(data && !err){
                try{
                setPending(true)
                showInfoToast()
                const task_id = data.task_id
                    const {status, result, error} = await pollForFile(task_id, setPending, controller) || {}
                    setresStatus(status)
                    if(error) {
                        showErrorToast(error)
                        setErrors(error)
                    }
                    if(result){
                        showSuccessToast()
                        console.log('result gotten succesfully')
                        setTable(JSON.parse(result), task_id, file.name)
                        removeFile()
                    }
                } catch (err) {
                    setErrors(err as string)
                }
            }
        }
    }

    const removeFile = ()=>{
        if(fileRef?.current?.value) fileRef.current.value = ''
        setFile(null)
        abort()
    }

  return (
    <div className="[&>*]:max-w-full my-2">
        <form action="/post" onSubmit={handleUpload} className="flex max-sm:flex-col-reverse max-w-full gap-2 justify-between " >
            <div className="flex flex-col space-y-2 max-w-full flex-wrap ">
                <input ref={fileRef} onChange={handleChange} 
                accept="application/pdf"
                type="file" className="flex flex-col text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-black
                    hover:file:bg-violet-100
                    "/>
                {!!file && <div className="flex gap-2 items-center">
                    <label htmlFor="password" className="text-sm">File Password</label>
                    <input type="text" name="password" className="border border-gray-200 rounded-md px-2 py-1" 
                    ref={passRef}
                    required/>
                </div>}
            </div>
            <div className="flex gap-4 max-sm:justify-center">
                {file && <button onClick={removeFile} type="button" className="text-white active:scale-90 h-fit bg-red-400 py-2 px-3 rounded-md">Remove</button>}
                <button type="submit" className="bg-blue-400  active:scale-90 py-2 px-3 rounded-md text-white
                   enabled:hover:bg-blue-500 disabled:bg-blue-200 disabled:cursor-not-allowed h-fit"
                    disabled={!file }>Upload</button>
            </div>
        </form>
        {errors && <div className="block text-red-400 border p-3 mt-3 rounded-md">
            <span>Error Occured: {errors}</span>
        </div>}
        {file && <div className="w-full flex justify-between border p-3 mt-3 rounded-md">
            <span>{file.name}</span>
            <span>{uploading || 0}% Uploaded</span>
            {pending && <i className="pi pi-spin pi-spinner"></i>}
            {(status == 'SUCCESS') && <i className="pi pi-check text-green-400" ></i>}
            <button className="text-red-500" onClick={removeFile}>
            <i className="pi pi-times" ></i>
            </button>
        </div>}
        <Toast ref={toastRef} className="w-fit" position="top-right"/>
    </div>
  )
}


export const DialogUploadForm = ()=>{
    const [visible, setVisible] = useState(false)

    return (
        <>
        <div onClick={()=> setVisible(true)} className="flex gap-2 flex-nowrap items-center">
        <span>Upload</span>
        <i className="pi pi-upload text-white cursor-pointer hover:scale-110" style={{ fontSize: '1rem' }} ></i>
        </div>
            <Dialog header="Upload Statement"  visible={visible}  className="w-[80%]"
            onHide={() => {if (!visible) return; setVisible(false);}}>
                <UploadForm />
            </Dialog>
        </>
    )
}
export default UploadForm