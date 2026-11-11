import { useEffect, useRef, useState } from 'react'
import type { Catalog, Color } from '../catalog'
import type { Language, Text } from '../i18n'
import { Icon } from './Icon'

function rgb(hex:string) { const value=parseInt(hex.slice(1),16); return [(value>>16)&255,(value>>8)&255,value&255] as const }
function nearestColor(sample:[number,number,number], colors:Color[]) {
  return colors.filter(c=>c.id!=='N/A'&&c.id!=='CLEAR').reduce<{color:Color|null;distance:number}>((best,color)=>{
    const [r,g,b]=rgb(color.hex); const distance=2*(sample[0]-r)**2+4*(sample[1]-g)**2+3*(sample[2]-b)**2
    return distance<best.distance?{color,distance}:best
  },{color:null,distance:Infinity}).color
}

export function ColorScanner({ t, language, catalog }: { t: Text; language: Language; catalog: Catalog }) {
  const videoRef=useRef<HTMLVideoElement>(null)
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const streamRef=useRef<MediaStream|null>(null)
  const [running,setRunning]=useState(false)
  const [error,setError]=useState(false)
  const [match,setMatch]=useState<Color|null>(null)
  async function start() {
    setError(false)
    try { const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false}); streamRef.current=stream; if(videoRef.current){videoRef.current.srcObject=stream; await videoRef.current.play()} setRunning(true) }
    catch { setError(true) }
  }
  function stop() { streamRef.current?.getTracks().forEach(track=>track.stop()); streamRef.current=null; setRunning(false) }
  useEffect(()=>{ if(!running)return; const timer=window.setInterval(()=>{
    const video=videoRef.current,canvas=canvasRef.current; if(!video||!canvas||video.readyState<2)return
    const size=48; canvas.width=size; canvas.height=size; const ctx=canvas.getContext('2d',{willReadFrequently:true}); if(!ctx)return
    const source=Math.min(video.videoWidth,video.videoHeight)*.18; ctx.drawImage(video,(video.videoWidth-source)/2,(video.videoHeight-source)/2,source,source,0,0,size,size)
    const pixels=ctx.getImageData(0,0,size,size).data; let r=0,g=0,b=0,count=0
    for(let i=0;i<pixels.length;i+=16){r+=pixels[i];g+=pixels[i+1];b+=pixels[i+2];count++}
    setMatch(nearestColor([r/count,g/count,b/count],catalog.colors))
  },450); return()=>window.clearInterval(timer)},[running,catalog.colors])
  useEffect(()=>()=>stop(),[])
  return <div className="mx-auto max-w-4xl">
    <div className="castle-heading"><span aria-hidden="true" /><div><h1 className="page-title">{t.scanner}</h1><small>{t.experimental}</small></div></div>
    <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600">{t.cameraHelp}</p>
    <div className="scanner-layout mt-7"><div className="camera-stage"><video ref={videoRef} muted playsInline /><canvas ref={canvasRef} hidden /><div className="scan-frame" aria-hidden="true" />{!running&&<div className="camera-empty"><Icon name="camera" className="h-12 w-12" /></div>}</div><aside className="scanner-result"><span>{t.closestColor}</span>{match?<><i style={{backgroundColor:match.hex}} /><strong>{match[language]}</strong><small>{match.id}</small></>:<p>—</p>}<button className={running?'secondary':'primary'} onClick={()=>running?stop():void start()}><Icon name="camera" className="h-5 w-5" />{running?t.stopCamera:t.startCamera}</button>{error&&<p className="error">{t.cameraError}</p>}</aside></div>
  </div>
}
