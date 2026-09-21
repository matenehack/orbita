/* ÓRBITA — Vanilla JS. No dependencias. El scroll siempre es nativo. */
'use strict';
document.documentElement.classList.add('js');
const $ = (selector) => document.querySelector(selector);
const clamp = (n,min=0,max=1) => Math.min(max,Math.max(min,n));
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion=preference.matches, frame=0, lastTime=0, dirty=true;
const videos=[...document.querySelectorAll('video[data-src]')];
// Mantiene los src vacíos en HTML y conecta aquí los videos proporcionados.
for(const video of videos){video.muted=true;video.src=video.dataset.src;}
const visibility=new Map();
function syncVideos(){for(const v of videos){if(reducedMotion||document.hidden||!visibility.get(v))v.pause();else v.play().catch(()=>{/* El póster sigue visible si el navegador bloquea autoplay. */});}}
preference.addEventListener('change',e=>{reducedMotion=e.matches;syncVideos();dirty=true;});
const videoObserver=new IntersectionObserver(entries=>{entries.forEach(e=>visibility.set(e.target,e.isIntersecting));syncVideos();},{threshold:.01});
videos.forEach(v=>videoObserver.observe(v));
// Revelado progresivo, sin ocultar contenido a lectores de pantalla.
const revealObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target);}},{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>revealObserver.observe(e));
const space=$('#space'), ctx=space.getContext('2d');
const tunnel=$('#hyperspace'), warpCtx=tunnel.getContext('2d');
let width=0,height=0,dpr=1;
// Tres poblaciones independientes; velocidad y tamaño aumentan con la cercanía.
const layers=[{speed:.09,size:.65,alpha:.3,count:190},{speed:.23,size:1,alpha:.55,count:110},{speed:.46,size:1.65,alpha:.85,count:55}].map(layer=>({...layer,stars:Array.from({length:layer.count},()=>({x:Math.random(),y:Math.random()}))}));
const rays=Array.from({length:230},()=>({angle:Math.random()*Math.PI*2,z:Math.random(),radius:.2+Math.random()*.8}));
function resize(){width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,2);for(const c of [space,tunnel]){c.width=width*dpr;c.height=height*dpr;}ctx?.setTransform(dpr,0,0,dpr,0,0);warpCtx?.setTransform(dpr,0,0,dpr,0,0);dirty=true;}
addEventListener('resize',resize,{passive:true});addEventListener('scroll',()=>dirty=true,{passive:true});
const hero=$('.hero'),heroMedia=$('.hero-media'),warp=$('#salto'),abyss=$('#abismo');
let scrollYValue=0,warpAmount=0,warpActive=false;
function updateScroll(){scrollYValue=window.scrollY;const fade=clamp(scrollYValue/hero.offsetHeight);heroMedia.style.opacity=String(1-fade);heroMedia.style.transform=reducedMotion?'none':`translateY(${scrollYValue*.28}px)`;const rect=warp.getBoundingClientRect();warpAmount=clamp(-rect.top/Math.max(1,warp.offsetHeight-height));warpActive=rect.top<height&&rect.bottom>0;$('#warp-progress').textContent=String(Math.round(warpAmount*100)).padStart(2,'0');const journey=clamp(scrollYValue/Math.max(1,document.documentElement.scrollHeight-height));$('#page-progress').style.transform=`scaleX(${journey})`;$('#journey-percent').textContent=String(Math.round(journey*100)).padStart(3,'0')+'%';$('#chapter-status').textContent=abyss.getBoundingClientRect().top<height*.5?'05 — EL ABISMO':rect.top<height*.5?'04 — HIPERVELOCIDAD':$('#servicios').getBoundingClientRect().top<height*.5?'03 — EXPLORACIÓN':$('#senal').getBoundingClientRect().top<height*.5?'02 — SEÑAL ISS':$('#mision').getBoundingClientRect().top<height*.5?'01 — LA MISIÓN':'01 — ORIGEN';}
function drawStars(){if(!ctx)return;ctx.clearRect(0,0,width,height);for(const layer of layers){ctx.fillStyle=`rgba(220,239,242,${layer.alpha})`;for(const s of layer.stars){const y=((s.y*height-(reducedMotion?0:scrollYValue*layer.speed))%height+height)%height;ctx.beginPath();ctx.arc(s.x*width,y,layer.size,0,Math.PI*2);ctx.fill();}}}
// Proyección radial: al avanzar por el tramo sticky, las estrellas se estiran.
function drawTunnel(dt){if(!warpCtx||!warpActive)return;warpCtx.clearRect(0,0,width,height);const speed=reducedMotion?0:.09+warpAmount*.8;const extent=Math.hypot(width,height)*.6;const fade=clamp(warpAmount*8+.2)*clamp((1-warpAmount)*7+.08);for(const ray of rays){ray.z=(ray.z+dt*speed)%1;const distance=ray.z*ray.z*extent*ray.radius;const length=reducedMotion?2:2+warpAmount*distance*.55;const x=Math.cos(ray.angle),y=Math.sin(ray.angle);warpCtx.strokeStyle=`rgba(210,236,244,${fade*(.2+ray.z*.65)})`;warpCtx.lineWidth=.5+ray.z*1.3;warpCtx.beginPath();warpCtx.moveTo(width/2+x*distance,height/2+y*distance);warpCtx.lineTo(width/2+x*(distance+length),height/2+y*(distance+length));warpCtx.stroke();}}
function tick(time){const dt=Math.min((time-lastTime)/1000,.04);lastTime=time;if(dirty){updateScroll();drawStars();dirty=false;drawTunnel(0);}if(!reducedMotion)drawTunnel(dt);frame=requestAnimationFrame(tick);}
document.addEventListener('visibilitychange',()=>{syncVideos();cancelAnimationFrame(frame);if(!document.hidden){lastTime=performance.now();dirty=true;frame=requestAnimationFrame(tick);}});
// Telemetría pública de la ISS. Actualiza con margen amplio respecto al límite de la API.
const issFields={status:$('#iss-status'),time:$('#iss-time'),lat:$('#iss-lat'),lon:$('#iss-lon'),alt:$('#iss-alt'),speed:$('#iss-speed'),marker:$('#iss-marker')};
let issRequest;
async function updateIss(){
  if(issRequest)issRequest.abort();
  const controller=new AbortController();
  issRequest=controller;
  const timeout=setTimeout(()=>controller.abort(),7000);
  issFields.status.textContent='RECIBIENDO SEÑAL';
  try{
    const response=await fetch('https://api.wheretheiss.at/v1/satellites/25544',{signal:controller.signal,cache:'no-store'});
    if(!response.ok)throw new Error('Respuesta no disponible');
    const data=await response.json();
    issFields.lat.textContent=`${Number(data.latitude).toFixed(4)}°`;
    issFields.lon.textContent=`${Number(data.longitude).toFixed(4)}°`;
    issFields.alt.textContent=`${Math.round(data.altitude)} km`;
    issFields.speed.textContent=`${Math.round(data.velocity).toLocaleString('es-PE')} km/h`;
    issFields.time.textContent=new Date(data.timestamp*1000).toLocaleTimeString('es-PE',{timeZone:'UTC',hour12:false})+' UTC';
    const mapX=clamp((Number(data.longitude)+180)/360);
    const mapY=clamp((90-Number(data.latitude))/180);
    issFields.marker.style.left=`${24+mapX*52}%`;
    issFields.marker.style.top=`${3+mapY*86}%`;
    issFields.status.textContent='SEÑAL RECIBIDA';
    $('.live-state').classList.remove('offline');
  }catch(error){
    if(controller===issRequest&&error.name!=='AbortError'){issFields.status.textContent='SEÑAL TEMPORALMENTE FUERA DE ALCANCE';$('.live-state').classList.add('offline');}
  }finally{clearTimeout(timeout);if(controller===issRequest)issRequest=null;}
}
$('#refresh-iss').addEventListener('click',updateIss);
updateIss();
setInterval(()=>{if(!document.hidden)updateIss();},20000);

// Integraciones nativas: compartir y pantalla completa, con alternativa segura.
const toast=$('#toast');
let toastTimer;
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2400);}
$('#share-button').addEventListener('click',async()=>{
  try{
    if(navigator.share)await navigator.share({title:document.title,text:'Un viaje inmersivo más allá de lo conocido.',url:location.href});
    else{await navigator.clipboard.writeText(location.href);showToast('ENLACE COPIADO');}
  }catch(error){if(error.name!=='AbortError')showToast('NO SE PUDO COMPARTIR');}
});
$('#fullscreen-toggle').addEventListener('click',async()=>{
  try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}
  catch{showToast('PANTALLA COMPLETA NO DISPONIBLE');}
});
document.addEventListener('fullscreenchange',()=>{$('#fullscreen-toggle').textContent=document.fullscreenElement?'×':'⌗';$('#fullscreen-toggle').setAttribute('aria-label',document.fullscreenElement?'Salir de pantalla completa':'Abrir en pantalla completa');});

resize();syncVideos();frame=requestAnimationFrame(tick);
