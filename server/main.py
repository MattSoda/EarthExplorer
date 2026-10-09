"""Optional FIRMS proxy. Run with uvicorn server.main:app --port 8000."""
import csv, io, math, os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
app=FastAPI(title='Earth Analog Explorer API')
app.add_middleware(CORSMiddleware,allow_origins=['http://localhost:5173','http://127.0.0.1:5173'],allow_methods=['GET'],allow_headers=['*'])
@app.get('/api/firms')
async def firms(lat:float=Query(ge=-90,le=90),lon:float=Query(ge=-180,le=180),days:int=Query(1,ge=1,le=10),radius_km:int=Query(100,ge=1,le=500)):
 key=os.getenv('FIRMS_MAP_KEY')
 if not key: raise HTTPException(503,'FIRMS_MAP_KEY is not configured')
 delta=radius_km/111.0;west=max(-180,lon-delta/max(.1,math.cos(math.radians(lat))));east=min(180,lon+delta/max(.1,math.cos(math.radians(lat))))
 box=f'{west},{max(-90,lat-delta)},{east},{min(90,lat+delta)}'
 url=f'https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/VIIRS_SNPP_NRT/{box}/{days}'
 try:
  async with httpx.AsyncClient(timeout=20) as client: response=await client.get(url);response.raise_for_status()
  rows=list(csv.DictReader(io.StringIO(response.text)))
  detections=[]
  for row in rows:
   try:
    a,b=float(row['latitude']),float(row['longitude'])
    if math.hypot((a-lat)*111,(b-lon)*111*math.cos(math.radians(lat)))<=radius_km:
     detections.append({'latitude':a,'longitude':b,'acq_date':row.get('acq_date',''),'acq_time':row.get('acq_time',''),'confidence':row.get('confidence','unknown'),'source':'VIIRS_SNPP_NRT'})
   except (ValueError,KeyError):continue
  return {'detections':detections,'source':'NASA FIRMS VIIRS SNPP NRT'}
 except httpx.HTTPError as exc:raise HTTPException(502,f'FIRMS upstream unavailable: {type(exc).__name__}') from exc
