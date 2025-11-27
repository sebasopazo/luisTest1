from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def hola_mundoTEST():
    return {"message": "hola mundo, final test"}
