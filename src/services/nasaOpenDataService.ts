export const openDataCatalog={name:'NASA Open Data',url:'https://data.nasa.gov/',status:'External catalog discovery',description:'Search NASA public dataset metadata. Catalog records are not automatically numerical observation APIs.'};
export function openDataSearchUrl(term:string){return `https://data.nasa.gov/browse?q=${encodeURIComponent(term)}`;}
