import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenEmpty,VbenField,VbenIcon,VbenInput,VbenMetric,VbenModal,VbenPermissionNote,VbenSelect,VbenSkeleton,VbenToast}from'../components/VbenUI.jsx';

const accept='image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';
const fmt=n=>{const x=Number(n||0);if(x<1024)return`${x} B`;if(x<1048576)return`${(x/1024).toFixed(1)} KB`;return`${(x/1048576).toFixed(1)} MB`};
function MediaError({error}){if(!error)return null;return <VbenAlert tone="danger" title={error.code||'Media request failed'}>{error.message||String(error)}{error.requestId?` · Request ${error.requestId}`:''}</VbenAlert>}
function AssetThumb({asset,detail=false}){const visible=asset.visibility==='PUBLIC'&&asset.url;if(!visible)return <div className={detail?'vben-media-detail-private':'vben-media-thumb is-private'}><VbenIcon name="lock" size={detail?28:17}/><span>Private</span></div>;if(asset.media_type==='VIDEO')return <div className={detail?'vben-media-detail-preview':'vben-media-thumb is-video'}><video src={asset.url} controls={detail} muted={!detail} playsInline preload="metadata"/><span className="vben-media-video-chip">VIDEO</span></div>;return detail?<div className="vben-media-detail-preview"><img src={asset.url} alt={asset.original_filename||''}/></div>:<div className="vben-media-thumb"><img src={asset.url} alt=""/></div>}

export function AssetsPage(){
 const{api,has}=useAuth();
 const[assets,setAssets]=useState([]),[err,setErr]=useState(null),[toast,setToast]=useState(''),[q,setQ]=useState(''),[type,setType]=useState(''),[visibility,setVisibility]=useState('');
 const[file,setFile]=useState(null),[uploadVisibility,setUploadVisibility]=useState('PUBLIC'),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[selected,setSelected]=useState(null);

 const load=async()=>{setErr(null);setLoading(true);try{const r=await api.request('/v1/merchant/assets',{query:{q:q||undefined,media_type:type||undefined,visibility:visibility||undefined,limit:120}});setAssets(r.data.assets||[])}catch(e){setErr(e)}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const shown=useMemo(()=>assets,[assets]);
 const imageCount=useMemo(()=>shown.filter(x=>x.media_type==='IMAGE').length,[shown]);
 const videoCount=useMemo(()=>shown.filter(x=>x.media_type==='VIDEO').length,[shown]);
 const privateCount=useMemo(()=>shown.filter(x=>x.visibility==='PRIVATE').length,[shown]);
 const totalUsage=useMemo(()=>shown.reduce((sum,x)=>sum+Number(x.usage_count||0),0),[shown]);

 const upload=async e=>{e.preventDefault();if(!file)return;setBusy(true);setErr(null);try{await api.request('/v1/merchant/assets/upload',{method:'POST',query:{filename:file.name,visibility:uploadVisibility},rawBody:file,contentType:file.type});setFile(null);const input=document.getElementById('asset-file-input');if(input)input.value='';setToast('Asset uploaded');await load()}catch(e){setErr(e)}finally{setBusy(false)}};
 const deactivate=async id=>{if(!confirm('Remove this asset from the active library? Product media using it will be deactivated.'))return;setErr(null);try{await api.request(`/v1/merchant/assets/${encodeURIComponent(id)}`,{method:'DELETE'});if(selected?.public_id===id)setSelected(null);setToast('Asset removed');await load()}catch(e){setErr(e)}};
 const copyUrl=async asset=>{if(!asset.url)return;try{await navigator.clipboard?.writeText(asset.url);setToast('Public URL copied')}catch{setToast('Could not copy URL')}};

 if(!has('catalog.read'))return <VbenPermissionNote permission="catalog.read"/>;

 return <div className="vben-media-page">
  <header className="vben-media-head"><div><span className="vben-media-kicker"><VbenIcon name="products" size={15}/>Catalog media</span><h1>Media Library</h1><p>Tenant-scoped images and videos for products and storefront content. Upload once, reuse safely, and keep the library compact.</p></div>{has('catalog.write')&&<div className="vben-media-head-actions"><VbenButton icon="plus" onClick={()=>document.getElementById('asset-file-input')?.click()}>Choose upload</VbenButton></div>}</header>
  <MediaError error={err}/>

  <div className="vben-media-metrics">
   <VbenMetric label="Active assets" value={shown.length} detail={`${totalUsage} total uses`} icon="products" tone="primary"/>
   <VbenMetric label="Images" value={imageCount} detail="JPEG, PNG, WEBP, GIF" icon="box" tone="success"/>
   <VbenMetric label="Videos" value={videoCount} detail="MP4 and WEBM" icon="pulse" tone="primary"/>
   <VbenMetric label="Private" value={privateCount} detail="Protected from public preview" icon="lock" tone={privateCount?'warning':'success'}/>
  </div>

  <div className="vben-media-layout">
   <VbenCard className="vben-media-library-card" title="Asset library" description={`${shown.length} active assets · compact square previews`}>
    <div className="vben-media-toolbar"><VbenInput icon="search" placeholder="Search filename or asset ID" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}/><VbenSelect value={type} onChange={e=>setType(e.target.value)}><option value="">All media</option><option>IMAGE</option><option>VIDEO</option></VbenSelect><VbenSelect value={visibility} onChange={e=>setVisibility(e.target.value)}><option value="">All visibility</option><option>PUBLIC</option><option>PRIVATE</option></VbenSelect><VbenButton variant="secondary" icon="filter" onClick={load}>Apply</VbenButton></div>
    {loading?<div className="vben-media-loading"><VbenSkeleton lines={6}/></div>:shown.length?<div className="vben-media-grid">{shown.map(asset=><article className="vben-media-item" key={asset.public_id}>
     <button type="button" className="vben-media-preview-button" onClick={()=>setSelected(asset)} aria-label={`Preview ${asset.original_filename}`}><AssetThumb asset={asset}/></button>
     <button type="button" className="vben-media-info" onClick={()=>setSelected(asset)}><strong title={asset.original_filename}>{asset.original_filename}</strong><small>{fmt(asset.file_size)} · {asset.mime_type}</small><div className="vben-media-badges"><VbenBadge tone={asset.media_type==='VIDEO'?'primary':'neutral'}>{asset.media_type}</VbenBadge><VbenBadge tone={asset.visibility==='PUBLIC'?'success':'warning'}>{asset.visibility}</VbenBadge><VbenBadge tone="neutral">{asset.usage_count||0} uses</VbenBadge></div><code>{asset.public_id}</code></button>
     <div className="vben-media-actions">{asset.url&&<VbenButton variant="ghost" size="sm" onClick={()=>copyUrl(asset)}>Copy URL</VbenButton>}{has('catalog.write')&&<VbenButton className="vben-media-remove" variant="ghost" size="sm" onClick={()=>deactivate(asset.public_id)}>Remove</VbenButton>}</div>
    </article>)}</div>:<VbenEmpty title="No assets found" description="No active media matches the current filters."/>}
   </VbenCard>

   {has('catalog.write')&&<VbenCard className="vben-media-upload-card" title="Upload asset" description="Images and video are kept tenant-scoped and reusable.">
    <form className="vben-media-upload-form" onSubmit={upload}><VbenField label="File" hint="JPEG, PNG, WEBP, GIF, MP4, or WEBM. SVG/HTML are blocked." required><input id="asset-file-input" className="vben-media-file-input" type="file" accept={accept} onChange={e=>setFile(e.target.files?.[0]||null)} required/></VbenField><VbenField label="Visibility"><VbenSelect value={uploadVisibility} onChange={e=>setUploadVisibility(e.target.value)}><option>PUBLIC</option><option>PRIVATE</option></VbenSelect></VbenField>{file&&<div className="vben-media-upload-summary"><span className="vben-media-upload-mark"><VbenIcon name={file.type?.startsWith('video/')?'pulse':'products'} size={17}/></span><div><strong>{file.name}</strong><small>{fmt(file.size)} · {file.type||'unknown type'}</small></div></div>}<VbenAlert tone="info" title="Visibility behavior">Public assets can render directly in product/storefront media. Private assets remain protected from public preview.</VbenAlert><VbenButton type="submit" loading={busy} disabled={!file} icon="plus">{busy?'Uploading…':'Upload to library'}</VbenButton></form>
   </VbenCard>}
  </div>

  <VbenModal open={!!selected} onClose={()=>setSelected(null)} title={selected?.original_filename||'Asset preview'} eyebrow="Media Library" size="lg" footer={selected&&<>{selected.url&&<VbenButton variant="secondary" onClick={()=>copyUrl(selected)}>Copy public URL</VbenButton>}{has('catalog.write')&&<VbenButton variant="ghost" className="vben-media-remove" onClick={()=>deactivate(selected.public_id)}>Remove asset</VbenButton>}</>}>
   {selected&&<div className="vben-media-detail"><AssetThumb asset={selected} detail/><div className="vben-media-detail-meta"><div><span>Media type</span><strong>{selected.media_type}</strong></div><div><span>Visibility</span><strong>{selected.visibility}</strong></div><div><span>File size</span><strong>{fmt(selected.file_size)}</strong></div><div><span>Usage</span><strong>{selected.usage_count||0} uses</strong></div><div className="vben-media-detail-span"><span>MIME type</span><strong>{selected.mime_type||'—'}</strong></div><div className="vben-media-detail-span"><span>Asset ID</span><code>{selected.public_id}</code></div></div></div>}
  </VbenModal>
  <VbenToast message={toast} onDone={()=>setToast('')}/>
 </div>;
}
