import type {Criterion,Score,Site,World} from '../types';
export const criteria:Criterion[]=['terrain','temperature','water','solar','geology','hazards'];
export const profiles:Record<World,Record<string,Record<Criterion,number>>>= {
 Moon:{'General lunar base':{terrain:4,temperature:1,water:1,solar:2,geology:3,hazards:2},'Lunar south polar region':{terrain:3,temperature:3,water:3,solar:3,geology:1,hazards:2},'Rocky lunar terrain':{terrain:5,temperature:1,water:0,solar:1,geology:5,hazards:1},'Potential resource exploration':{terrain:2,temperature:1,water:5,solar:1,geology:4,hazards:1}},
 Mars:{'General Martian environment':{terrain:3,temperature:2,water:2,solar:1,geology:3,hazards:2},'Cold arid terrain':{terrain:3,temperature:4,water:4,solar:1,geology:2,hazards:2},'Volcanic terrain':{terrain:3,temperature:1,water:1,solar:1,geology:5,hazards:2},'Potential resource exploration':{terrain:2,temperature:2,water:5,solar:2,geology:4,hazards:1}}
};
export function scoreSite(site:Site,world:World,weights:Record<Criterion,number>,enabled:Criterion[]):Score{
 const parts:Score['parts']={};const missing:Criterion[]=[];let numerator=0,denominator=0,available=0,total=0;
 for(const criterion of enabled){const weight=Math.max(0,weights[criterion]||0);if(!weight)continue;total+=weight;
 const evidence=site.evidence[criterion];if(!evidence){missing.push(criterion);continue;}
 // Values are qualitative suitability estimates for terrestrial field work, not measured planetary similarity.
 const adjusted=criterion==='water'&&world==='Moon'?evidence.value*.85:evidence.value;
 parts[criterion]={...evidence,value:adjusted};numerator+=adjusted*weight;denominator+=weight;available+=weight;
 }
 return {score:denominator?Math.round(numerator/denominator*100):null,coverage:total?Math.round(available/total*100):0,parts,missing};
}
export function rankSites(items:Site[],world:World,weights:Record<Criterion,number>,enabled:Criterion[]){return items.map(site=>({site,result:scoreSite(site,world,weights,enabled)})).sort((a,b)=>(b.result.score??-1)-(a.result.score??-1));}
export function validCoordinates(lat:number,lon:number){return Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;}
