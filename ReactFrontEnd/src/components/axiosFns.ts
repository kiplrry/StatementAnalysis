import axios from "axios"
import { Dispatch, SetStateAction } from "react";

const axioInstance = axios.create({
    baseURL: 'http://localhost:8000'
})

export const uploadFile = async (file: File, password: string, onProgress: Dispatch<SetStateAction<number>>, controller: AbortController) => {
    const signal = controller ? controller.signal : undefined
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
  
    try {
      const res = await axioInstance.post('/api/upload-file', formData, {
        signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progress)=>{
            const percentCompleted = Math.round((progress.loaded * 100) / (progress?.total || 1));
            onProgress(percentCompleted);
        }
      });
      const data = res.data;
      console.log('Upload successful:', data);
      return {data}
    } catch (err) {
      console.error('Error during file upload:', err);
      return {err}
    }
  };

const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

export const getAnalysedFile = async (task_id: string, pending: CallableFunction, controller: AbortController) => {
    if(!task_id) return
    const signal = controller.signal
    try{
    const res = await axioInstance.get(`/api/poll-result/${task_id}`, {signal})
    if(res.status == 502) return await getAnalysedFile(task_id, pending, controller)
    const {status, result, error} = res.data
    // console.log(res.data)
    if(status == 'FAILED'){
        pending(false)
        console.log('failed')
        return {error, status}
    } 
    if(status == 'SUCCESS'){
        pending(false)
        return {status, result}
    }
    } catch(err: unknown){
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        throw err
      }
      console.error('An error occurred:', err);
      throw err;
    }
}

export const getStatus = async (task_id: string, controller: AbortController): Promise<Status>=>{
  try {
  if(!task_id) throw Error('Task id is needed')
  const signal = controller.signal
  const res = await axioInstance.get(`/api/task-status/${task_id}`, {signal})
  const {status, error} = res.data
  return {status, error}
} catch (err){
  return {status: 'FAILED', error: String(err)}
}
}

export const getFile = async (task_id: string, controller: AbortController) => {
  if(!task_id) throw new Error('task id is needed')
  try{
    const res = await axioInstance.get(`/api/get-result/${task_id}`, {signal: controller.signal})
    const {status, result, error} = res.data
    return {status, result, error}
  } catch (err){
    // throw new Error(`An error occured: ${err.toString()}`)
    return {status: 'FAILED', result: undefined, error: String(err)}
  }
}

export const pollForFile = async (task_id: string, pending: CallableFunction, controller: AbortController) => {
  let {status, error} = await getStatus(task_id, controller)
  while(status === 'PENDING') {
    pending(true)
    await sleep(7000);
    ({status, error} = await getStatus(task_id, controller))
  }
  pending(false)
  if(status == 'FAILED' && error) return {status, error, result: undefined}
  if(status == "SUCCESS") {
    const fileRes = await getFile(task_id, controller)
    return fileRes
  }
}

interface Status {
  status: 'PENDING' | 'FAILED' | 'SUCCESS',
  error? : string
}