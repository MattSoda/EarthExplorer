export type World='Moon'|'Mars';
export type Criterion='terrain'|'temperature'|'water'|'solar'|'geology'|'hazards';
export type Evidence={value:number; explanation:string; kind:'qualitative'|'measured'; source:string};
export type Site={id:string;name:string;region:string;country:string;lat:number;lon:number;terrain:string;description:string;worlds:World[];tags:string[];experiments:string[];limitations:string[];sources:string[];evidence:Partial<Record<Criterion,Evidence>>};
export type Score={score:number|null;coverage:number;parts:Partial<Record<Criterion,Evidence>>;missing:Criterion[]};
export type ClimatePoint={date:string;temperature:number|null;solar:number|null;precipitation:number|null};
export type ClimateResult={points:ClimatePoint[];url:string;retrievedAt:string;start:string;end:string;source:'NASA POWER';status:'live'|'cached'};
