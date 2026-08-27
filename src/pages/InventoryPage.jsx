import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenDateTime,VbenField,VbenIcon,VbenInput,VbenMetric,VbenModal,VbenPermissionNote,VbenSelect,VbenSkeleton,VbenSwitch,VbenTable,VbenTabs,VbenTextarea,VbenToast}from'../components/VbenUI.jsx';

const MOVEMENTS=['RECEIVE','RETURN','DAMAGE','ADJUSTMENT'];
const blankAdjustment={inventory_item_id:'',location_id:'',movement_type:'RECEIVE',quantity:1,reason:'Admin adjustment'};
const blankLocation={code:'',name:'',status:'ACTIVE',is_default:false};

function InventoryError({error}){if(!error)return null;return <VbenAlert tone="danger" title={error.code||'Inventory request failed'}>{error.message||String(error)}{error.requestId?` · Request ${error.requestId}`:''}</VbenAlert>}
const movementTone=row=>Number(row.on_hand_delta)<0?'warning':'success';
const inventoryTone=value=>Number(value)<=0?'danger':Number(value)<=5?'warning':'success';

export function InventoryPage(){
 const{api,has}=useAuth();
 const[rows,setRows]=useState([]),[locations,setLocations]=useState([]),[ledger,setLedger]=useState([]),[err,setErr]=useState(null),[toast,setToast]=useState('');
 const[tab,setTab]=useState('balances'),[open,setOpen]=useState(false),[locationOpen,setLocationOpen]=useState(false),[ledgerItem,setLedgerItem]=useState('');
 const[form,setForm]=useState(blankAdjustment),[locationForm,setLocationForm]=useState(blankLocation),[editLocation,setEditLocation]=useState(null);
 const[loading,setLoading]=useState(true),[ledgerLoading,setLedgerLoading]=useState(false),[busy,setBusy]=useState(false);
 const[q,setQ]=useState(''),[balanceLocation,setBalanceLocation]=useState(''),[stockFilter,setStockFilter]=useState('');

 const load=async()=>{setErr(null);setLoading(true);try{const[i,l]=await Promise.all([api.request('/v1/merchant/inventory'),api.request('/v1/merchant/inventory/locations')]);setRows(i.data.inventory||[]);setLocations(l.data.locations||[])}catch(e){setErr(e)}finally{setLoading(false)}};
 const loadLedger=async(item='')=>{setErr(null);setLedgerLoading(true);try{const d=await api.request('/v1/merchant/inventory/ledger',{query:{inventory_item_id:item||undefined,limit:150}});setLedger(d.data.ledger||d.data.movements||[]);setLedgerItem(item)}catch(e){setErr(e)}finally{setLedgerLoading(false)}};
 useEffect(()=>{load()},[]);
 useEffect(()=>{if(tab==='ledger')loadLedger(ledgerItem)},[tab]);

 const validateMovement=()=>{const quantity=Number(form.quantity);if(!Number.isInteger(quantity)||quantity===0)throw new Error('Stock change must be a non-zero whole number');if(['RECEIVE','RETURN'].includes(form.movement_type)&&quantity<0)throw new Error(`${form.movement_type} requires a positive quantity`);if(form.movement_type==='DAMAGE'&&quantity>0)throw new Error('DAMAGE requires a negative quantity');return quantity};
 const submit=async(e)=>{e.preventDefault();setBusy(true);setErr(null);try{validateMovement();await api.request('/v1/merchant/inventory/adjustments',{method:'POST',body:{...form,quantity:Number(form.quantity),location_id:form.location_id||undefined}});setOpen(false);setForm(blankAdjustment);setToast('Inventory adjusted');await load();if(tab==='ledger')await loadLedger(form.inventory_item_id)}catch(e){setErr(e)}finally{setBusy(false)}};
 const createLocation=async(e)=>{e.preventDefault();setBusy(true);setErr(null);try{await api.request('/v1/merchant/inventory/locations',{method:'POST',body:locationForm});setLocationOpen(false);setLocationForm(blankLocation);setToast('Inventory location created');await load()}catch(e){setErr(e)}finally{setBusy(false)}};
 const saveLocation=async()=>{setBusy(true);setErr(null);try{await api.request(`/v1/merchant/inventory/locations/${encodeURIComponent(editLocation.public_id||editLocation.id)}`,{method:'PATCH',body:{name:editLocation.name,status:editLocation.status,is_default:Boolean(editLocation.is_default)}});setEditLocation(null);setToast('Inventory location updated');await load()}catch(e){setErr(e)}finally{setBusy(false)}};
 const startAdjustment=row=>{setForm({...blankAdjustment,inventory_item_id:row?.inventory_item_id||'',location_id:row?.location_id||row?.location_public_id||''});setOpen(true)};
 const inspectLedger=row=>{setTab('ledger');loadLedger(row.inventory_item_id)};

 const itemOptions=useMemo(()=>[...new Map(rows.map(row=>[row.inventory_item_id,row])).values()],[rows]);
 const locationNames=useMemo(()=>[...new Set(rows.map(row=>row.location_name).filter(Boolean))],[rows]);
 const filteredRows=useMemo(()=>{const needle=q.trim().toLowerCase();return rows.filter(row=>{const matchesSearch=!needle||[row.product_name,row.variant_title,row.sku,row.location_name,row.inventory_item_id].some(value=>String(value||'').toLowerCase().includes(needle));const matchesLocation=!balanceLocation||row.location_name===balanceLocation;const available=Number(row.available||0);const matchesStock=!stockFilter||(stockFilter==='low'?available<=5:stockFilter==='out'?available<=0:available>5);return matchesSearch&&matchesLocation&&matchesStock})},[rows,q,balanceLocation,stockFilter]);
 const onHand=useMemo(()=>rows.reduce((sum,row)=>sum+Number(row.on_hand||0),0),[rows]);
 const reserved=useMemo(()=>rows.reduce((sum,row)=>sum+Number(row.reserved||0),0),[rows]);
 const available=useMemo(()=>rows.reduce((sum,row)=>sum+Number(row.available||0),0),[rows]);
 const low=useMemo(()=>rows.filter(row=>Number(row.available)<=5).length,[rows]);

 if(!has('inventory.read'))return <VbenPermissionNote permission="inventory.read"/>;

 const balanceColumns=[
  {key:'product_name',label:'Inventory item',render:r=><button type="button" className="vben-inventory-item-link" onClick={()=>inspectLedger(r)}><span className="vben-inventory-item-icon"><VbenIcon name="box" size={17}/></span><span><strong>{r.product_name}</strong><small>{r.variant_title||r.sku||'Base product'}</small></span></button>},
  {key:'location_name',label:'Location',render:r=><span className="vben-inventory-location"><VbenIcon name="mapPin" size={14}/>{r.location_name||'Default'}</span>},
  {key:'on_hand',label:'On hand',render:r=><strong>{r.on_hand}</strong>},
  {key:'reserved',label:'Reserved',render:r=><span className="vben-inventory-number-muted">{r.reserved}</span>},
  {key:'available',label:'Available',render:r=><VbenBadge tone={inventoryTone(r.available)}>{r.available}</VbenBadge>},
  {key:'state',label:'Stock state',render:r=><span className={`vben-inventory-state is-${Number(r.available)<=0?'out':Number(r.available)<=5?'low':'healthy'}`}>{Number(r.available)<=0?'Out of stock':Number(r.available)<=5?'Low stock':'Healthy'}</span>},
  ...(has('inventory.write')?[{key:'actions',label:'',render:r=><VbenButton variant="ghost" size="sm" icon="plus" onClick={()=>startAdjustment(r)}>Adjust</VbenButton>}]:[])
 ];
 const ledgerColumns=[
  {key:'movement_type',label:'Movement',render:r=><VbenBadge tone={movementTone(r)}>{r.movement_type}</VbenBadge>},
  {key:'product_name',label:'Inventory item',render:r=><div className="vben-inventory-ledger-item"><strong>{r.product_name||r.sku||r.inventory_item_id}</strong><small>{r.variant_title||r.location_name||''}</small></div>},
  {key:'on_hand_delta',label:'On-hand Δ',render:r=><strong className={Number(r.on_hand_delta)<0?'vben-inventory-negative':'vben-inventory-positive'}>{Number(r.on_hand_delta)>0?'+':''}{r.on_hand_delta}</strong>},
  {key:'reserved_delta',label:'Reserved Δ',render:r=><span>{Number(r.reserved_delta)>0?'+':''}{r.reserved_delta}</span>},
  {key:'after',label:'After movement',render:r=><div className="vben-inventory-after"><span>On hand <strong>{r.on_hand_after}</strong></span><span>Reserved <strong>{r.reserved_after}</strong></span></div>},
  {key:'reason',label:'Reason',render:r=><span className="vben-inventory-reason">{r.reason||'—'}</span>},
  {key:'created_at',label:'Time',render:r=><span className="vben-inventory-time"><VbenDateTime value={r.created_at}/></span>}
 ];
 const locationColumns=[
  {key:'name',label:'Location',render:r=><button type="button" className="vben-inventory-location-link" onClick={()=>has('inventory.write')&&setEditLocation({...r})}><span className="vben-inventory-location-mark"><VbenIcon name="mapPin" size={16}/></span><span><strong>{r.name}</strong><small>{r.code}</small></span></button>},
  {key:'status',label:'Status',render:r=><VbenBadge tone={r.status==='ACTIVE'?'success':'danger'}>{r.status}</VbenBadge>},
  {key:'is_default',label:'Role',render:r=>r.is_default?<VbenBadge tone="primary">DEFAULT</VbenBadge>:<span className="vben-inventory-number-muted">Secondary</span>},
  {key:'created_at',label:'Created',render:r=><span className="vben-inventory-time"><VbenDateTime value={r.created_at}/></span>}
 ];

 return <div className="vben-inventory-page">
  <header className="vben-inventory-head"><div><span className="vben-inventory-kicker"><VbenIcon name="inventory" size={15}/>Inventory operations</span><h1>Inventory</h1><p>Operate stock balances, locations, reservations, and the append-only inventory ledger from one compact control surface.</p></div>{has('inventory.write')&&<div className="vben-inventory-head-actions"><VbenButton variant="secondary" icon="mapPin" onClick={()=>setLocationOpen(true)}>New location</VbenButton><VbenButton icon="plus" onClick={()=>startAdjustment()}>Adjust stock</VbenButton></div>}</header>
  <InventoryError error={err}/>

  <div className="vben-inventory-metrics">
   <VbenMetric label="Inventory lines" value={rows.length} detail={`${locations.length} locations`} icon="box" tone="primary"/>
   <VbenMetric label="On hand" value={onHand} detail={`${available} units available`} icon="inventory" tone="success"/>
   <VbenMetric label="Reserved" value={reserved} detail="Protected from manual reductions" icon="lock" tone="warning"/>
   <VbenMetric label="Low stock lines" value={low} detail={low?'Review replenishment':'Stock levels healthy'} icon="alert" tone={low?'warning':'success'} onClick={()=>{setTab('balances');setStockFilter('low')}}/>
  </div>

  <VbenTabs value={tab} onChange={setTab} items={[{value:'balances',label:'Balances',count:rows.length},{value:'ledger',label:'Ledger',count:ledger.length},{value:'locations',label:'Locations',count:locations.length}]}/>

  {tab==='balances'&&<VbenCard className="vben-inventory-card" title="Stock balances" description="Reserved stock stays protected while available inventory remains immediately visible.">
   <div className="vben-inventory-toolbar"><VbenInput icon="search" placeholder="Search product, variant, SKU, location…" value={q} onChange={e=>setQ(e.target.value)}/><VbenSelect value={balanceLocation} onChange={e=>setBalanceLocation(e.target.value)}><option value="">All locations</option>{locationNames.map(name=><option key={name} value={name}>{name}</option>)}</VbenSelect><VbenSelect value={stockFilter} onChange={e=>setStockFilter(e.target.value)}><option value="">All stock states</option><option value="healthy">Healthy</option><option value="low">Low stock</option><option value="out">Out of stock</option></VbenSelect><span className="vben-inventory-result-count">{filteredRows.length} of {rows.length} lines</span></div>
   {loading?<div className="vben-inventory-loading"><VbenSkeleton lines={5}/></div>:<VbenTable rows={filteredRows} keyField="inventory_item_id" columns={balanceColumns} ariaLabel="Inventory balances" emptyTitle="No inventory lines" emptyDescription="No balances match the current filters."/>}
  </VbenCard>}

  {tab==='ledger'&&<VbenCard className="vben-inventory-card" title="Inventory ledger" description="Append-only movement history with before/after operational context.">
   <div className="vben-inventory-ledger-toolbar"><VbenSelect value={ledgerItem} onChange={e=>loadLedger(e.target.value)}><option value="">All inventory items</option>{itemOptions.map(r=><option key={r.inventory_item_id} value={r.inventory_item_id}>{r.product_name} — {r.variant_title||r.sku||'Base'}</option>)}</VbenSelect><VbenButton variant="secondary" size="sm" icon="refresh" loading={ledgerLoading} onClick={()=>loadLedger(ledgerItem)}>Refresh</VbenButton></div>
   {ledgerLoading?<div className="vben-inventory-loading"><VbenSkeleton lines={5}/></div>:<VbenTable rows={ledger} keyField="id" columns={ledgerColumns} ariaLabel="Inventory ledger" emptyTitle="No ledger movements" emptyDescription="Movements will appear here after stock operations."/>}
  </VbenCard>}

  {tab==='locations'&&<VbenCard className="vben-inventory-card" title="Inventory locations" description="Manage active stock locations and the default fulfillment inventory source." actions={has('inventory.write')&&<VbenButton size="sm" icon="plus" onClick={()=>setLocationOpen(true)}>New location</VbenButton>}>
   {loading?<div className="vben-inventory-loading"><VbenSkeleton lines={4}/></div>:<VbenTable rows={locations} keyField="public_id" columns={locationColumns} ariaLabel="Inventory locations" emptyTitle="No inventory locations" emptyDescription="Create a location before receiving stock."/>}
  </VbenCard>}

  <VbenModal open={open} onClose={()=>!busy&&setOpen(false)} title="Inventory adjustment" eyebrow="Inventory operations" footer={<><VbenButton variant="secondary" disabled={busy} onClick={()=>setOpen(false)}>Cancel</VbenButton><VbenButton type="submit" form="inv-form" loading={busy}>Apply adjustment</VbenButton></>}>
   <form id="inv-form" className="vben-inventory-form" onSubmit={submit}><div className="vben-inventory-form-grid"><VbenField label="Inventory item" required><VbenSelect value={form.inventory_item_id} onChange={e=>setForm({...form,inventory_item_id:e.target.value})} required><option value="">Select item</option>{itemOptions.map(r=><option key={r.inventory_item_id} value={r.inventory_item_id}>{r.product_name} — {r.variant_title||r.sku||'Base'}</option>)}</VbenSelect></VbenField><VbenField label="Location"><VbenSelect value={form.location_id} onChange={e=>setForm({...form,location_id:e.target.value})}><option value="">Default location</option>{locations.filter(l=>l.status==='ACTIVE').map(l=><option key={l.public_id||l.id} value={l.public_id||l.id}>{l.name}</option>)}</VbenSelect></VbenField><VbenField label="Movement type" required><VbenSelect value={form.movement_type} onChange={e=>setForm({...form,movement_type:e.target.value})}>{MOVEMENTS.map(value=><option key={value}>{value}</option>)}</VbenSelect></VbenField><VbenField label="On-hand delta" hint="RECEIVE/RETURN use positive whole numbers. DAMAGE uses a negative whole number." required><VbenInput type="number" step="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} required/></VbenField><VbenField className="vben-inventory-span-2" label="Reason" required><VbenTextarea rows="3" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} required/></VbenField></div><VbenAlert tone="info" title="Audited stock movement">This operation writes through /v1/merchant/inventory/adjustments and is recorded in the inventory ledger.</VbenAlert></form>
  </VbenModal>

  <VbenModal open={locationOpen} onClose={()=>!busy&&setLocationOpen(false)} title="Create inventory location" eyebrow="Inventory locations" size="md" footer={<><VbenButton variant="secondary" disabled={busy} onClick={()=>setLocationOpen(false)}>Cancel</VbenButton><VbenButton type="submit" form="loc-form" loading={busy}>Create location</VbenButton></>}>
   <form id="loc-form" className="vben-inventory-form" onSubmit={createLocation}><VbenField label="Code" required><VbenInput value={locationForm.code} onChange={e=>setLocationForm({...locationForm,code:e.target.value})} placeholder="WAREHOUSE_2" required/></VbenField><VbenField label="Name" required><VbenInput value={locationForm.name} onChange={e=>setLocationForm({...locationForm,name:e.target.value})} placeholder="Secondary warehouse" required/></VbenField><VbenField label="Status"><VbenSelect value={locationForm.status} onChange={e=>setLocationForm({...locationForm,status:e.target.value})}><option>ACTIVE</option><option>INACTIVE</option></VbenSelect></VbenField><div className="vben-inventory-switch-box"><VbenSwitch checked={locationForm.is_default} onChange={checked=>setLocationForm({...locationForm,is_default:checked})} label="Default location" description="Use this as the default inventory location for stock operations."/></div></form>
  </VbenModal>

  <VbenModal open={!!editLocation} onClose={()=>!busy&&setEditLocation(null)} title="Edit inventory location" eyebrow="Inventory locations" size="md" footer={<><VbenButton variant="secondary" disabled={busy} onClick={()=>setEditLocation(null)}>Cancel</VbenButton><VbenButton loading={busy} onClick={saveLocation}>Save location</VbenButton></>}>
   {editLocation&&<div className="vben-inventory-form"><div className="vben-inventory-location-summary"><div><span>Code</span><strong>{editLocation.code}</strong></div><div><span>Created</span><strong><VbenDateTime value={editLocation.created_at}/></strong></div></div><VbenField label="Name"><VbenInput value={editLocation.name} onChange={e=>setEditLocation({...editLocation,name:e.target.value})}/></VbenField><VbenField label="Status"><VbenSelect value={editLocation.status} onChange={e=>setEditLocation({...editLocation,status:e.target.value})}><option>ACTIVE</option><option>INACTIVE</option></VbenSelect></VbenField><div className="vben-inventory-switch-box"><VbenSwitch checked={Boolean(editLocation.is_default)} onChange={checked=>setEditLocation({...editLocation,is_default:checked})} label="Default location" description="The current default must stay active until another location is made default."/></div></div>}
  </VbenModal>
  <VbenToast message={toast} onDone={()=>setToast('')}/>
 </div>;
}
