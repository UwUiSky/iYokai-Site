"""Public price catalogue from a private operator-controlled file. No checkout."""
import json
from pathlib import Path
from typing import Literal
from pydantic import BaseModel,Field,StrictInt,ConfigDict

class Product(BaseModel):
    model_config=ConfigDict(extra='forbid')
    id: Literal['premium','vip-1','vip-5','vip-20']
    tier: Literal['premium','vip']
    label: str=Field(min_length=1,max_length=40)
    monthly_minor: StrictInt|None=Field(default=None,ge=0,le=100000000)
    annual_minor: StrictInt|None=Field(default=None,ge=0,le=100000000)
    monthly_ai_tokens: StrictInt|None=Field(default=None,ge=0,le=1000000000)

def catalogue(settings):
    raw=json.loads(Path(settings.commerce_file).read_text())
    products=[Product.model_validate(p).model_dump() for p in raw['products']]
    if len({p['id'] for p in products})!=4 or len(products)!=4:raise ValueError('Four unique products required')
    if raw.get('currency')!='EUR':raise ValueError('Unsupported currency')
    return {'checkout_ready':False,'launch_free':raw.get('launch_free') is True,'currency':'EUR','cycles':['monthly','annual'],'lifetime':'contact','products':products}
