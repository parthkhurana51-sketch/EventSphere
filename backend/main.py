from fastapi import FastAPI

app = FastAPI(title="EventSphere API")


@app.get("/")
def root():
    return {"message": "EventSphere API is running!"}