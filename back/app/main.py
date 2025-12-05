from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt  # needs PyJWT
from datetime import datetime, timedelta
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(root_path="/api")
security = HTTPBearer()
origins = [
    "http://localhost:3000",   # si usas Next.js local
    "http://localhost:5173",   # si usas Vite
    "https://tarea-luis-tls.click",  # tu front futuro (si está en dominio)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load RSA keys
PRIVATE_KEY = Path("/etc/secure/keys/privateRSA.pem").read_text()

PUBLIC_KEY = Path("/etc/secure/keys/publicRSA.pem").read_text()


@app.get("/hello")
def hola_mundoTEST():
    return {"message": "hola mundo, RSA"}


def create_jwt(user_id: str):
    expiration = datetime.utcnow() + timedelta(minutes=2)
    payload = {
        "sub": user_id,
        "exp": expiration,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, PRIVATE_KEY, algorithm="RS256")
    return token


def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        decoded = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


@app.get("/getJWT")
def login():
    """Devuelve un JWT firmado con RS256"""
    token = create_jwt("usuario_demo")
    return {"token": token}


@app.get("/secure")
def secure_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        user = verify_jwt(credentials)
        return {
            "message": "Acceso autorizado",
            "user_claims": user
        }
    except HTTPException as e:
        # Diferenciar token expirado vs inválido según el detail lanzado en verify_jwt
        detail = str(e.detail).lower()
        if "expir" in detail:
            raise HTTPException(status_code=401, detail="Token expirado. Por favor, vuelva a autenticarse.")
        if "invál" in detail or "invalid" in detail:
            raise HTTPException(status_code=401, detail="Token inválido. Verifique el token o la firma.")
        raise
