import type {Site} from '../types';
import './SitePhoto.css';

type Photo = {url:string;alt:string;credit:string;source:string};
const photos:Record<string,Photo>={
  'dry-valleys':{url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Taylor_Valley_2015_01.jpg/1280px-Taylor_Valley_2015_01.jpg',alt:'Typical rocky landscape in Taylor Valley, McMurdo Dry Valleys, Antarctica',credit:'Jayne Belnap / USGS · Public domain',source:'https://commons.wikimedia.org/wiki/File:Taylor_Valley_2015_01.jpg'},
  atacama:{url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Atacama_Desert_Landscape_%28iced_moment_870-CC%29.jpg/1280px-Atacama_Desert_Landscape_%28iced_moment_870-CC%29.jpg',alt:'Arid landscape of the Atacama Desert in Chile',credit:'L. Honnorat / ESO · CC BY 4.0',source:'https://commons.wikimedia.org/wiki/File:Atacama_Desert_Landscape_(iced_moment_870-CC).jpg'},
  hawaii:{url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/HAVO_Mauna_Loa_lava_N_J_Wei_%2853205527322%29.jpg/1280px-HAVO_Mauna_Loa_lava_N_J_Wei_%2853205527322%29.jpg',alt:'Aerial view of recent lava extrusion on Mauna Loa, Hawaii',credit:'Hawaiʻi Volcanoes National Park / NPS · Public domain',source:'https://commons.wikimedia.org/wiki/File:HAVO_Mauna_Loa_lava_N_J_Wei_(53205527322).jpg'},
  iceland:{url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Langisj%C3%B3r_Lake_Iceland_%28179215697%29.jpeg/1280px-Langisj%C3%B3r_Lake_Iceland_%28179215697%29.jpeg',alt:'Langisjór Lake in the Icelandic Highlands',credit:'Ilya Grigorik · CC BY-SA 3.0',source:'https://commons.wikimedia.org/wiki/File:Langisj%C3%B3r_Lake_Iceland_(179215697).jpeg'},
  mojave:{url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Mojave_Desert_Landscape_at_Gold_Butte_%2854090157227%29.jpg/1280px-Mojave_Desert_Landscape_at_Gold_Butte_%2854090157227%29.jpg',alt:'Rocky desert landscape in the Mojave region at Gold Butte',credit:'BLM Nevada · Public domain',source:'https://commons.wikimedia.org/wiki/File:Mojave_Desert_Landscape_at_Gold_Butte_(54090157227).jpg'}
};

export function SitePhoto({site,variant}:{site:Site;variant:'feature'|'thumbnail'}){
  const photo=photos[site.id];
  return <figure className={`site-photo site-photo--${variant}`}>
    {photo&&<img src={photo.url} alt={photo.alt} loading="lazy" onError={event=>{event.currentTarget.style.display='none'}}/>}
    <figcaption><span>{site.name}</span>{photo&&<a href={photo.source} target="_blank" rel="noreferrer" aria-label={`Photo credit: ${photo.credit}`}>{photo.credit}</a>}</figcaption>
  </figure>;
}
