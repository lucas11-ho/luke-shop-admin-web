import React,{useId,useState}from'react';

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
};

export function VbenIcon({name,size=18,className=''}){const icon=paths[name]||paths.info;return <svg className={vcn('vui-icon',className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon.map((d,i)=><path d={d} key={`${name}-${i}`}/>)}</svg>}

export function VbenButton({variant='primary',size='md',loading=false,icon,children,className='',type='button',disabled,...props}){return <button type={type} className={vcn('vui-button',`vui-button-${variant}`,`vui-button-${size}`,className)} disabled={disabled||loading} aria-busy={loading||undefined} {...props}>{loading?<VbenSpinner size="sm"/>:icon?<VbenIcon name={icon} size={size==='sm'?15:17}/>:null}<span>{children}</span></button>}

export function VbenSpinner({size='md'}){return <span className={vcn('vui-spinner',`vui-spinner-${size}`)} aria-hidden="true"/>}

export function VbenField({label,hint,error,required=false,children,className=''}){return <div className={vcn('vui-field',error&&'has-error',className)}><div className="vui-field-label"><span>{label}</span>{required&&<b>*</b>}</div>{children}{error?<small className="vui-field-error">{error}</small>:hint?<small className="vui-field-hint">{hint}</small>:null}</div>}

export const VbenInput=React.forwardRef(function VbenInput({icon,suffix,className='',...props},ref){return <div className={vcn('vui-input-wrap',className)}>{icon&&<span className="vui-input-prefix"><VbenIcon name={icon} size={17}/></span>}<input ref={ref} className="vui-input" {...props}/>{suffix&&<span className="vui-input-suffix">{suffix}</span>}</div>});

export function VbenPasswordInput({value,onChange,...props}){const[visible,setVisible]=useState(false);return <VbenInput {...props} value={value} onChange={onChange} type={visible?'text':'password'} suffix={<button type="button" className="vui-input-action" onClick={()=>setVisible(v=>!v)} aria-label={visible?'Hide password':'Show password'}><VbenIcon name={visible?'eyeOff':'eye'} size={17}/></button>}/>}

export function VbenSelect({children,className='',...props}){return <div className={vcn('vui-select-wrap',className)}><select className="vui-select" {...props}>{children}</select><VbenIcon name="chevron" size={15}/></div>}

export function VbenTextarea({className='',...props}){return <textarea className={vcn('vui-textarea',className)} {...props}/>}

export function VbenCard({title,description,actions,children,className=''}){return <section className={vcn('vui-card',className)}>{(title||actions)&&<header className="vui-card-head"><div>{title&&<h2>{title}</h2>}{description&&<p>{description}</p>}</div>{actions&&<div className="vui-card-actions">{actions}</div>}</header>}<div className="vui-card-body">{children}</div></section>}

export function VbenAlert({tone='info',title,children,className=''}){return <div className={vcn('vui-alert',`vui-alert-${tone}`,className)} role={tone==='danger'?'alert':'status'}><span className="vui-alert-icon"><VbenIcon name={tone==='danger'?'alert':tone==='success'?'check':'info'} size={17}/></span><div>{title&&<strong>{title}</strong>}{children&&<span>{children}</span>}</div></div>}

export function VbenBadge({tone='neutral',children}){return <span className={vcn('vui-badge',`vui-badge-${tone}`)}>{children}</span>}

export function VbenDivider({label}){return <div className="vui-divider"><i/>{label&&<span>{label}</span>}<i/></div>}

export function VbenSwitch({checked,onChange,label,description,disabled=false}){const id=useId();return <label className={vcn('vui-switch-row',disabled&&'is-disabled')} htmlFor={id}><span><strong>{label}</strong>{description&&<small>{description}</small>}</span><span className="vui-switch"><input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={e=>onChange?.(e.target.checked)}/><i/></span></label>}

export function VbenEmpty({title='No data',description='There is nothing to display yet.',action}){return <div className="vui-empty"><div className="vui-empty-mark">◇</div><strong>{title}</strong><span>{description}</span>{action&&<div>{action}</div>}</div>}

export function VbenSkeleton({lines=3}){return <div className="vui-skeleton" aria-hidden="true">{Array.from({length:lines},(_,i)=><i key={i}/>)}</div>}
