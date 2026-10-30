"""Authenticated encryption for contact text; the encryption key stays server-side.
Old plaintext is not silently treated as encrypted. Rotation accepts old keys
only for decryption; new data uses the first configured key.
"""
from cryptography.fernet import Fernet, MultiFernet
from fastapi import HTTPException

def cipher(settings):
    try:
        keys=[Fernet(k.strip().encode()) for k in settings.data_keys.split(',') if k.strip()]
        if not keys:raise ValueError()
        return MultiFernet(keys)
    except (ValueError,AttributeError):raise HTTPException(503,'Private data encryption is not configured') from None

def encrypt(settings,value):return 'fernet:v1:'+cipher(settings).encrypt(value.encode()).decode()
def decrypt(settings,value):
    if not value.startswith('fernet:v1:'):return '[Legacy unencrypted request: migration required]'
    try:return cipher(settings).decrypt(value[10:].encode()).decode()
    except HTTPException:raise
    except Exception:raise HTTPException(503,'Private data could not be decrypted') from None
