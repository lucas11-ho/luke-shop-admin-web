import React,{useEffect,useId,useState}from'react';

export const vcn=(...values)=>values.filter(Boolean).join(' ');

const paths={
  store:['M4 10h16','M5 10V6h14v4','M6 10v9h12v-9','M9 19v-5h6v5'],
  mail:['M3 5h18v14H3z','m3 7 6 5 6-5'],
  lock:['M6 10V8a6 6 0 0 1 12 0v2','M5 10h14v11H5z','M12 14v3'],
  eye:['M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z','M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6'],
  eyeOff:['m3 3 18 18','M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a15.8 15.8 0 0 1-2.1 2.9','M6.2 6.2C3.8 7.8 2.5 12 2.5 12s3.5 6 9.5 6c1.4 0 2.7-.3 3.8-.8','M9.9 9.9a3 3 0 0 0 4.2 4.2'],
  check:['M5 12l4 4L19 6'],
  alert:['M12 9v4','M12 17h.01','M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0z'],
  info:['M12 8h.01','M11 12h1v4h1','M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20'],
  chevron:['M9 6l6 6-6 6'],
  search:['M21 21l-4.3-4.3','M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0'],
  plus:['M12 5v14','M5 12h14'],
  close:['M6 6l12 12','M18 6 6 18'],
  dashboard:['M4 4h6v6H4z','M14 4h6v10h-6z','M4 14h6v6H4z','M14 18h6v2h-6z'],
  orders:['M6 3h12v18H6z','M9 7h6','M9 11h6','M9 15h4'],
  payments:['M3 6h18v12H3z','M3 10h18','M7 15h3'],
  inventory:['M4 7l8-4 8 4-8 4z','M4 7v10l8 4 8-4V7','M12 11v10'],
  products:['M4 6h16v14H4z','M8 6V4h8v2','M8 11h8','M8 15h5'],
  users:['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M22 21v-2a4 4 0 0 0-3-3.9','M16 3.1a4 4 0 0 1 0 7.8'],
  promotions:['M20 12 12 20 4 12 12 4z','M9.5 9.5h.01','M14.5 14.5h.01','m9 15 6-6'],
  wallet:['M3 6h16v12H3z','M16 10h5v4h-5z'],
  box:['M4 7l8-4 8 4-8 4z','M4 7v10l8 4 8-4V7','M12 11v10'],
  arrowRight:['M5 12h14','m13 6 6 6-6 6'],
  refresh:['M20 11a8 8 0 1 0 2 5','M20 4v7h-7'],
  pulse:['M3 12h4l2-5 4 10 2-5h6'],
  mapPin:['M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0','M12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6'],
  truck:['M3 6h11v10H3z','M14 10h4l3 3v3h-7z','M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4','M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4'],
  history:['M3 12a9 9 0 1 0 3-6.7','M3 4v5h5','M12 7v5l3 2'],
  filter:['M4 5h16','M7 12h10','M10 19h4'],
  receipt:['M6 3h12v18l-3-2-3 2-3-2-3 2z','M9 8h6','M9 12h6','M9 16h4'],
};

export function vbenStatusTone(s=''){const x=String(s).toUpperCase();if(['ACTIVE','PAID','PUBLISHED','DELIVERED','COMPLETED','READY','SUCCEEDED'].includes(x))return'success';if(['FAILED','BLOCKED','DISABLED','CANCELLED','REFUNDED','INACTIVE','ARCHIVED','EXPIRED','PAYMENT_FAILED'].includes(x))return'danger';if(['SUSPENDED','PENDING','PENDING_PAYMENT','PROCESSING','PREPARING','DRAFT','PAUSED','REFUND_PENDING','SCHEDULED','OUT_FOR_DELIVERY'].includes(x))return'warning';return'neutral'}

export function VbenIcon({name,size=18,className=''}){const icon=paths[name]||paths.info;return <svg className={vcn('vui-icon',className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon.map((d,i)=><path d={d} key={`${name}-${i}`}/>)}</svg>}

export function VbenButton({variant='primary',size='md',loading=false,icon,children,className='',type='button',disabled,...props}){return <button type={type} className={vcn('vui-button',`vui-button-${variant}`,`vui-button-${size}`,className)} disabled={disabled||loading} aria-busy={loading||undefined} {...props}>{loading?<VbenSpinner size="sm"/>:icon?<VbenIcon name={icon} size={size==='sm'?15:17}/>:null}<span>{children}</span></button>}

export function VbenSpinner({size='md'}){return <span className={vcn('vui-spinner',`vui-spinner-${size}`)} aria-hidden="true"/>}

export function VbenField({label,hint,error,required=false,children,className=''}){return <div className={vcn('vui-field',error&&'has-error',className)}><div className="vui-field-label"><span>{label}</span>{required&&<b>*</b>}</div>{children}{error?<small className="vui-field-error">{error}</small>:hint?<small className="vui-field-hint">{hint}</small>:null}</div>}

export const VbenInput=React.forwardRef(function VbenInput({icon,suffix,className='',...props},ref){return <div className={vcn('vui-input-wrap',className)}>{icon&&<span className="vui-input-prefix"><VbenIcon name={icon} size={17}/></span>}<input ref={ref} className="vui-input" {...props}/>{suffix&&<span className="vui-input-suffix">{suffix}</span>}</div>});

export function VbenPasswordInput({value,onChange,...props}){const[visible,setVisible]=useState(false);return <VbenInput {...props} value={value} onChange={onChange} type={visible?'text':'password'} suffix={<button type="button" className="vui-input-action" onClick={()=>setVisible(v=>!v)} aria-label={visible?'Hide password':'Show password'}><VbenIcon name={visible?'eyeOff':'eye'} size={17}/></button>}/>}

export function VbenSelect({children,className='',...props}){return <div className={vcn('vui-select-wrap',className)}><select className="vui-select" {...props}>{children}</select><VbenIcon name="chevron" size={15}/></div>}

export function VbenTextarea({className='',...props}){return <textarea className={vcn('vui-textarea',className)} {...props}/>}

export function VbenCard({title,description,actions,children,className=''}){return <section className={vcn('vui-card',className)}>{(title||actions)&&<header className="vui-card-head"><div>{title&&<h2>{title}</h2>}{description&&<p>{description}</p>}</div>{actions&&<div className="vui-card-actions">{actions}</div>}</header>}<div className="vui-card-body">{children}</div></section>}

export function VbenMetric({label,value,detail,icon='info',tone='primary',onClick}){const content=<><span className={vcn('vui-metric-icon',`vui-metric-icon-${tone}`)}><VbenIcon name={icon} size={18}/></span><span className="vui-metric-copy"><small>{label}</small><strong>{value}</strong>{detail&&<span>{detail}</span>}</span>{onClick&&<VbenIcon name="arrowRight" size={15} className="vui-metric-arrow"/>}</>;return onClick?<button type="button" className="vui-metric" onClick={onClick}>{content}</button>:<div className="vui-metric">{content}</div>}

export function VbenAlert({tone='info',title,children,className=''}){return <div className={vcn('vui-alert',`vui-alert-${tone}`,className)} role={tone==='danger'?'alert':'status'}><span className="vui-alert-icon"><VbenIcon name={tone==='danger'?'alert':tone==='success'?'check':'info'} size={17}/></span><div>{title&&<strong>{title}</strong>}{children&&<span>{children}</span>}</div></div>}

export function VbenBadge({tone='neutral',children}){return <span className={vcn('vui-badge',`vui-badge-${tone}`)}>{children}</span>}

export function VbenDivider({label}){return <div className="vui-divider"><i/>{label&&<span>{label}</span>}<i/></div>}

export function VbenSwitch({checked,onChange,label,description,disabled=false}){const id=useId();return <label className={vcn('vui-switch-row',disabled&&'is-disabled')} htmlFor={id}><span><strong>{label}</strong>{description&&<small>{description}</small>}</span><span className="vui-switch"><input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={e=>onChange?.(e.target.checked)}/><i/></span></label>}

export function VbenEmpty({title='No data',description='There is nothing to display yet.',action}){return <div className="vui-empty"><div className="vui-empty-mark">◇</div><strong>{title}</strong><span>{description}</span>{action&&<div>{action}</div>}</div>}

export function VbenTable({columns,rows,keyField='id',emptyTitle='No records',emptyDescription='There is nothing to display yet.',ariaLabel='Data table'}){if(!rows?.length)return <VbenEmpty title={emptyTitle} description={emptyDescription}/>;return <div className="vui-table-wrap"><table className="vui-table" aria-label={ariaLabel}><thead><tr>{columns.map(column=><th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={row[keyField]||row.public_id||index}>{columns.map(column=><td key={column.key}>{column.render?column.render(row):row[column.key]??'—'}</td>)}</tr>)}</tbody></table></div>}

export function VbenModal({open,onClose,title,eyebrow='Luke Shop',children,footer,size='lg'}){useEffect(()=>{if(!open)return;const key=e=>e.key==='Escape'&&onClose?.();window.addEventListener('keydown',key);const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{window.removeEventListener('keydown',key);document.body.style.overflow=previous}},[open,onClose]);if(!open)return null;return <div className="vui-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose?.()}><section className={vcn('vui-modal',`vui-modal-${size}`)} role="dialog" aria-modal="true" aria-label={title||'Workspace'}><header className="vui-modal-head"><div><span>{eyebrow}</span><h2>{title}</h2></div><button type="button" className="vui-modal-close" onClick={onClose} aria-label="Close"><VbenIcon name="close" size={18}/></button></header><div className="vui-modal-body">{children}</div>{footer&&<footer className="vui-modal-foot">{footer}</footer>}</section></div>}

export function VbenTabs({value,onChange,items}){return <div className="vui-tabs" role="tablist">{items.map(item=><button type="button" role="tab" aria-selected={value===item.value} key={item.value} className={value===item.value?'is-active':''} onClick={()=>onChange(item.value)}>{item.label}{item.count!==undefined&&<span>{item.count}</span>}</button>)}</div>}

export function VbenToast({message,onDone,tone='success'}){useEffect(()=>{if(!message)return;const timer=setTimeout(()=>onDone?.(),3200);return()=>clearTimeout(timer)},[message,onDone]);if(!message)return null;return <div className={vcn('vui-toast',`vui-toast-${tone}`)} role="status"><VbenIcon name={tone==='danger'?'alert':'check'} size={16}/><span>{message}</span></div>}

export function VbenPermissionNote({permission}){return <VbenAlert tone="warning" title="Permission required">Your merchant role does not include {permission}.</VbenAlert>}

export function VbenMoney({value,currency='USD'}){const amount=Number(value||0);return <>{new Intl.NumberFormat(undefined,{style:'currency',currency}).format(amount)}</>}
export function VbenDateTime({value}){return <>{value?new Date(value).toLocaleString():'—'}</>}

export function VbenSkeleton({lines=3}){return <div className="vui-skeleton" aria-hidden="true">{Array.from({length:lines},(_,i)=><i key={i}/>)}</div>}
