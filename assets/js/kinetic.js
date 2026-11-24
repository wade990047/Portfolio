/* Motion is progressive enhancement: every page works with this file disabled. */
(() => {
 const root=document.documentElement,main=document.querySelector('main');
 if(!main||!window.matchMedia)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false;
 try{paused=sessionStorage.getItem('portfolio-motion-paused')==='true'}catch{}
 const toggle=document.createElement('button');
 toggle.type='button';toggle.className='motion-toggle';document.body.append(toggle);
 const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 const mark=document.createElement('div');mark.className='kinetic-mark';mark.setAttribute('aria-hidden','true');document.body.append(mark);
 const activeAnimations=new Set();
 const running=()=>!paused&&!reduced.matches&&!document.hidden;
 const sync=()=>{
  root.dataset.motion=running()?'running':'paused';
  toggle.hidden=reduced.matches;
  toggle.textContent=paused?'播放動態':'暫停動態';
  toggle.setAttribute('aria-label',paused?'播放頁面裝飾動畫':'暫停頁面裝飾動畫');
  toggle.setAttribute('aria-pressed',String(paused));
  if(!running()){activeAnimations.forEach(a=>a.cancel());activeAnimations.clear();}
 };
 toggle.addEventListener('click',()=>{paused=!paused;try{sessionStorage.setItem('portfolio-motion-paused',String(paused))}catch{}sync()});
 reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
 let scheduled=false;
 const updateProgress=()=>{scheduled=false;const range=root.scrollHeight-innerHeight;root.style.setProperty('--progress',range>0?String(scrollY/range):'0');};
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress)}},{passive:true});
 addEventListener('resize',updateProgress);updateProgress();
 // Hit-test on every scroll, even when the pointer is stationary. Rows themselves
 // never translate, so their clickable and hover areas remain stable.
 const partnerRows=Array.from(main.querySelectorAll('.partner-row'));
 if(partnerRows.length){
  let pointer=null,activeRow=null;
  const activate=row=>{
   if(row===activeRow)return;
   activeRow?.classList.remove('is-active');
   activeRow=row;
   activeRow?.classList.add('is-active');
  };
  const hitTest=()=>{
   if(!pointer)return;
   const hit=document.elementFromPoint(pointer.x,pointer.y)?.closest('.partner-row');
   activate(partnerRows.includes(hit)?hit:null);
  };
  document.addEventListener('pointermove',event=>{
   if(event.pointerType!=='mouse')return;
   pointer={x:event.clientX,y:event.clientY};hitTest();
  },{passive:true});
  document.addEventListener('pointerout',event=>{if(!event.relatedTarget){pointer=null;activate(null)}},{passive:true});
  addEventListener('scroll',hitTest,{passive:true,capture:true});
  addEventListener('resize',hitTest,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pointer=null;activate(null)}});
 }
 if(!('IntersectionObserver' in window)||!Element.prototype.animate)return;
 const seen=new WeakSet();
 const selector='.hero-copy > *, .section-head, .work-card, .update-row, .page-header, .home-about-copy, .profile, .detail-title, .detail-intro, .media-stack > figure, .gallery figure, .event-posters figure, .tool-usage, .project-milestones, .about-copy > *, .credits';
 const observer=new IntersectionObserver(entries=>{
  let stagger=0;
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   observer.unobserve(entry.target);
   if(!running()||entry.target.contains(document.activeElement))continue;
   const isCard=entry.target.matches('.work-card,.partner-row,.update-row');
   const animation=entry.target.animate([
    {opacity:.3,transform:isCard?'translateY(36px)':'translateY(20px)'},
    {opacity:1,transform:'translateY(0)'}
   ],{duration:isCard?850:650,delay:Math.min(stagger++*70,280),easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
   activeAnimations.add(animation);animation.onfinish=animation.oncancel=()=>activeAnimations.delete(animation);
   const image=entry.target.querySelector('.work-image img');
   if(image){const reveal=image.animate([{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:1200,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});activeAnimations.add(reveal);reveal.onfinish=reveal.oncancel=()=>activeAnimations.delete(reveal);}
  }
 },{threshold:0,rootMargin:'0px 0px -20px 0px'});
 const observe=()=>{main.querySelectorAll(selector).forEach(el=>{if(!seen.has(el)){seen.add(el);observer.observe(el)}});updateProgress()};
 observe();new MutationObserver(observe).observe(main,{childList:true,subtree:true});
 main.addEventListener('focusin',()=>{activeAnimations.forEach(a=>a.cancel());activeAnimations.clear()});
})();
