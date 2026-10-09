import {z} from 'zod';import {getJSON} from './http';import type {ClimateResult} from '../types';
const schema=z.object({properties:z.object({parameter:z.record(z.record(z.number().nullable()))})});
export async function fetchPower(lat:number,lon:number,start:string,end:string):Promise<ClimateResult>{
 if(!/^\d{8}$/.test(start)||!/^\d{8}$/.test(end)||start>end)throw new Error('Invalid NASA POWER date range');
 const url=new URL('https://power.larc.nasa.gov/api/temporal/daily/point');url.searchParams.set('parameters','T2M,ALLSKY_SFC_SW_DWN,PRECTOTCORR');url.searchParams.set('community','RE');url.searchParams.set('longitude',String(lon));url.searchParams.set('latitude',String(lat));url.searchParams.set('start',start);url.searchParams.set('end',end);url.searchParams.set('format','JSON');
 const {value,cached}=await getJSON<unknown>(url.toString(),3600000);const parsed=schema.parse(value);const p=parsed.properties.parameter;const dates=Object.keys(p.T2M||{}).sort();if(!dates.length)throw new Error('NASA POWER returned no daily temperature records');const clean=(v:number|undefined|null)=>v==null||v<=-990?null:v;
 return {points:dates.map(date=>({date,temperature:clean(p.T2M?.[date]),solar:clean(p.ALLSKY_SFC_SW_DWN?.[date]),precipitation:clean(p.PRECTOTCORR?.[date])})),url:url.toString(),retrievedAt:new Date().toISOString(),start,end,source:'NASA POWER',status:cached?'cached':'live'};
}
