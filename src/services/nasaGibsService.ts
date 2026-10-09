export const gibsLayers=[{id:'MODIS_Terra_CorrectedReflectance_TrueColor',name:'MODIS Terra true color',description:'NASA GIBS daily browse imagery (not numerical measurements)',maxZoom:9}];
export function gibsTileUrl(layer:string,date:string){return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;}
export function worldviewUrl(lat:number,lon:number){return `https://worldview.earthdata.nasa.gov/?v=${lon-3},${lat-3},${lon+3},${lat+3}`;}
