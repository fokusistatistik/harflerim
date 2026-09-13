import os

from fastapi import Header, HTTPException


def verify_auth(x_auth_key: str = Header(None)) -> bool:
    expected_key = os.getenv("PAPATYA_PYTHON_AUTH_KEY")
    if not expected_key:
        raise HTTPException(status_code=500, detail="PAPATYA_PYTHON_AUTH_KEY ortam değişkeni ayarlanmamış.")
    if x_auth_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Auth Key")
    return True
