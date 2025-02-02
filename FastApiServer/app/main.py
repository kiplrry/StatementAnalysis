#!/usr/bin/env python3
from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import datetime
import asyncio
from celery.result import AsyncResult
from app.celery import app as celery_app
from app.tasks import process_data
from app.tempcleaner import delete_old_files

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost"],  # Replace "*" with specific origins for better security
    allow_credentials=True,
    allow_methods=["*"],  # Or specify methods like ["GET", "POST"]
    allow_headers=["*"], 
    )


@app.get("/")
def read_root():
    return {"message": "Welcome"}

def result(task_result):
    if not task_result.ready():
            return JSONResponse({"status": "PENDING"}, status_code=202)
    if task_result.successful():
            return JSONResponse({"status": "SUCCESS", "result": task_result.result['data']})
    if task_result.failed():
            print(task_result.info)
            return JSONResponse({"status": "FAILED", "error": str(task_result.info)})

@app.post("/api/upload-file")
async def upload_file(
    file: UploadFile, 
    password: str = Form(...)):
    """View for file upload

    :param file: PDF file
    :type file: UploadFile
    :param password: Password, defaults to Form(...)
    :type password: str, optional
    :return: JSONRESPONSE
    :rtype: str
    """
    try:
        # Save the file temporarily
        timenow = str(datetime.datetime.now().time())
        temp_file_path = f"tmp/{timenow}_{file.filename}"
        os.makedirs("tmp", exist_ok=True)
        delete_old_files('tmp', 10)
        with open(temp_file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Trigger Celery task with the file path
        task = process_data.delay(temp_file_path, password)

        return JSONResponse({"task_id": task.id}, status_code=202)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=str(e))

# Get task result view
@app.get("/api/get-result/{task_id}")
async def get_task_result(task_id: str):
    try:
        task_result = AsyncResult(task_id, app=celery_app)

        # Poll for task completion
        if not task_result.ready():
            return JSONResponse({"status": "PENDING"}, status_code=202)

        return result(task_result)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/poll-result/{task_id}")
async def get_task_result(task_id: str):
    try:
        task_result = AsyncResult(task_id, app=celery_app)
        while not task_result.ready():
            await asyncio.sleep(2)

        return result(task_result)
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/task-status/{task_id}")
async def task_status(task_id: str):
    try:
        task_result = AsyncResult(task_id, app=celery_app)
        return result(task_result)
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))