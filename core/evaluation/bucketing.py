from __future__ import annotations
import hashlib



BUCKET_COUNT = 10000

def generate_bucket(
        flag_name: str,
        user_id: str,

) -> float:
    
    if not flag_name.strip():
        raise ValueError("flag_name cannot be empty")
    
    if not user_id.strip():
        raise ValueError("user_id cannot be empty")
    
    bucket_key = f"{flag_name}:{user_id}"

    digest = hashlib.sha256(bucket_key.encode()).hexdigest()
    bucket_value = int(digest, 16) 
    bucket = bucket_value % BUCKET_COUNT
    return bucket/100
