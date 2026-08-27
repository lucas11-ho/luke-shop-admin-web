import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenDateTime,VbenField,VbenInput,VbenMetric,VbenModal,VbenPasswordInput,VbenSelect,VbenSkeleton,VbenTable,VbenTabs,VbenTextarea,VbenToast,vbenStatusTone}from'../components/VbenUI.jsx';

const blankStaff={email:'',display_name:'',password:'',role_ids:[]};
const blankRole={key:'',name:'',description:'',permission_keys:[]};
const uniq=v=>[...new Set(v)];
const toggle=(arr,value)=>arr.includes(value)?arr.filter(x=>x!==value):[...arr,value];
const tabItems=[{value:'Staff',label:'Staff'},{value:'Roles',label:'Roles'},{value:'Permissions',label:'Permissions'}];

export function AccessPage(){
 const{session,api,has,refreshProfile}=useAuth();
 const[tab,setTab]=useState('Staff'),[staff,setStaff]=useState([]),[roles,setRoles]=useState([]),[permissions,setPermissions]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[toast,setToast]=useState(''),[q,setQ]=useState(''),[busy,setBusy]=useState('');
 const[staffModal,setStaffModal]=useState(false),[staffForm,setStaffForm]=useState(blankStaff),[editStaff,setEditStaff]=useState(null),[editStaffForm,setEditStaffForm]=useState({display_name:'',status:'ACTIVE',role_ids:[]});
 const[roleModal,setRoleModal]=useState(false),[editRole,setEditRole]=useState(null),[roleForm,setRoleForm]=useState(blankRole);
 const[passwordStaff,setPasswordStaff]=useState(null),[newPassword,setNewPassword]=useState('');
 const[sessionsStaff,setSessionsStaff]=useState(null),[sessions,setSessions]=useState([]),[sessionsLoading,setSessionsLoading]=useState(false);
 const canStaffRead=has('merchant.staff.read'),canStaffManage=has('merchant.staff.manage'),canRolesRead=has('merchant.roles.read'),canRolesManage=has('merchant.roles.manage'),canSessionsManage=has('merchant.sessions.manage');
 const isOwner=(session?.user?.roles||[]).includes('OWNER');
 const canAccess=canStaffRead||canRolesRead;
 const allowedRoleOptions=useMemo(()=>roles.filter(r=>isOwner||r.key!=='OWNER'),[roles,isOwner]);
 const grantablePermissions=useMemo(()=>permissions.filter(p=>isOwner||(session?.user?.permissions||[]).includes(p.key)),[permissions,isOwner,session]);
 const filteredStaff=useMemo(()=>{const x=q.trim().toLowerCase();if(!x)return staff;return staff.filter(s=>[s.display_name,s.email,...(s.roles||[])].some(v=>String(v||'').toLowerCase().includes(x)))},[staff,q]);
 const activeStaff=staff.filter(s=>s.status==='ACTIVE').length,customRoles=roles.filter(r=>!r.is_system).length,totalSessions=staff.reduce((n,s)=>n+Number(s.active_sessions||0),0);

 const load=async()=>{setLoading(true);setError(null);try{const jobs=[];if(canStaffRead)jobs.push(api.request('/v1/merchant/staff').then(x=>setStaff(x.data.staff||[])));else setStaff([]);if(canRolesRead)jobs.push(api.request('/v1/merchant/roles').then(x=>setRoles(x.data.roles||[])));else setRoles([]);if(canRolesRead)jobs.push(api.request('/v1/merchant/permissions').then(x=>setPermissions(x.data.permissions||[])));else setPermissions([]);await Promise.all(jobs)}catch(e){setError(e)}finally{setLoading(false)}};
 useEffect(()=>{load()},[canStaffRead,canRolesRead]);

 const openCreateStaff=()=>{setStaffForm(blankStaff);setStaffModal(true)};
 const createStaff=async()=>{setBusy('create-staff');setError(null);try{await api.request('/v1/merchant/staff',{method:'POST',body:{...staffForm,email:staffForm.email.trim(),display_name:staffForm.display_name.trim(),role_ids:uniq(staffForm.role_ids)}});setStaffModal(false);setToast('Staff account created');await load()}catch(e){setError(e)}finally{setBusy('')}};
 const openEditStaff=async row=>{setBusy(`staff-${row.id}`);setError(null);try{const d=await api.request(`/v1/merchant/staff/${row.id}`);const s=d.data.staff;setEditStaff(s);setEditStaffForm({display_name:s.display_name,status:s.status==='BLOCKED'?'DISABLED':s.status,role_ids:(s.roles||[]).map(r=>r.id)})}catch(e){setError(e)}finally{setBusy('')}};
 const saveStaff=async()=>{setBusy('save-staff');setError(null);try{const currentRoles=(editStaff.roles||[]).map(r=>r.id).sort().join('|'),nextRoles=uniq(editStaffForm.role_ids).sort().join('|');await api.request(`/v1/merchant/staff/${editStaff.id}`,{method:'PATCH',body:{display_name:editStaffForm.display_name.trim(),status:editStaffForm.status}});if(canRolesManage&&currentRoles!==nextRoles)await api.request(`/v1/merchant/staff/${editStaff.id}/roles`,{method:'PUT',body:{role_ids:uniq(editStaffForm.role_ids)}});if(editStaff.id===session.user.id)await refreshProfile();setEditStaff(null);setToast('Staff account updated');await load()}catch(e){setError(e)}finally{setBusy('')}};
 const resetPassword=async()=>{setBusy('reset-password');setError(null);try{await api.request(`/v1/merchant/staff/${passwordStaff.id}/reset-password`,{method:'POST',body:{new_password:newPassword}});setPasswordStaff(null);setNewPassword('');setToast('Password reset and active sessions revoked');await load()}catch(e){setError(e)}finally{setBusy('')}};
 const forceLogout=async row=>{if(!window.confirm(`Force logout all active sessions for ${row.display_name}?`))return;setBusy(`logout-${row.id}`);setError(null);try{const d=await api.request(`/v1/merchant/staff/${row.id}/force-logout`,{method:'POST',body:{}});setToast(`${d.data.sessions_revoked} session(s) revoked`);await load()}catch(e){setError(e)}finally{setBusy('')}};
 const openSessions=async row=>{setSessionsStaff(row);setSessions([]);setSessionsLoading(true);setError(null);try{const d=await api.request(`/v1/merchant/staff/${row.id}/sessions`);setSessions(d.data.sessions||[])}catch(e){setError(e)}finally{setSessionsLoading(false)}};
 const revokeSession=async s=>{setBusy(`session-${s.id}`);setError(null);try{await api.request(`/v1/merchant/staff/${sessionsStaff.id}/sessions/${s.id}`,{method:'DELETE'});setSessions(x=>x.map(v=>v.id===s.id?{...v,active:false,revoked_at:new Date().toISOString()}:v));setToast('Session revoked')}catch(e){setError(e)}finally{setBusy('')}};

 const openCreateRole=()=>{setEditRole(null);setRoleForm(blankRole);setRoleModal(true)};
 const openEditRole=r=>{setEditRole(r);setRoleForm({key:r.key,name:r.name,description:r.description||'',permission_keys:r.permissions||[]});setRoleModal(true)};
 const saveRole=async()=>{setBusy('save-role');setError(null);try{if(editRole){await api.request(`/v1/merchant/roles/${editRole.id}`,{method:'PATCH',body:{name:roleForm.name.trim(),description:roleForm.description.trim()||null}});const a=[...(editRole.permissions||[])].sort().join('|'),b=uniq(roleForm.permission_keys).sort().join('|');if(a!==b)await api.request(`/v1/merchant/roles/${editRole.id}/permissions`,{method:'PUT',body:{permission_keys:uniq(roleForm.permission_keys)}})}else await api.request('/v1/merchant/roles',{method:'POST',body:{key:roleForm.key.trim(),name:roleForm.name.trim(),description:roleForm.description.trim()||null,permission_keys:uniq(roleForm.permission_keys)}});setRoleModal(false);setToast(editRole?'Role updated':'Role created');await load()}catch(e){setError(e)}finally{setBusy('')}};
 const deleteRole=async r=>{if(!window.confirm(`Delete role ${r.name}? It must not be assigned to any staff account.`))return;setBusy(`role-${r.id}`);setError(null);try{await api.request(`/v1/merchant/roles/${r.id}`,{method:'DELETE'});setToast('Role deleted');await load()}catch(e){setError(e)}finally{setBusy('')}};

 if(!canAccess)return <div className="vben-access-page"><div className="vben-access-hero"><div><span className="vben-access-eyebrow">Security administration</span><h1>Access & roles</h1><p>Your current account is authenticated, but it does not have staff/RBAC read permission.</p></div></div><VbenCard title="Current merchant"><div className="vben-access-current"><div><span>Name</span><strong>{session.user.display_name}</strong></div><div><span>Email</span><strong>{session.user.email}</strong></div><div><span>Roles</span><div className="vben-access-badges">{(session.user.roles||[]).map(r=><VbenBadge key={r}>{r}</VbenBadge>)}</div></div></div></VbenCard></div>;

 return <div className="vben-access-page">
  <div className="vben-access-hero"><div><span className="vben-access-eyebrow">Security administration</span><h1>Staff & access</h1><p>Create merchant staff, assign least-privilege roles, reset passwords, and revoke sessions. Backend authorization remains the source of truth for every access decision.</p></div><div className="vben-access-actions">{canStaffManage&&canRolesRead&&<VbenButton icon="plus" onClick={openCreateStaff}>Create staff</VbenButton>}{canRolesManage&&<VbenButton variant="secondary" icon="plus" onClick={openCreateRole}>Create role</VbenButton>}</div></div>
  {error&&<VbenAlert tone="danger" title={error.code||'Request failed'}>{error.message||'Unable to complete the access-control request.'}</VbenAlert>}
  {loading?<VbenCard><VbenSkeleton lines={7}/></VbenCard>:<>
   <div className="vben-access-metrics"><VbenMetric label="Staff" value={staff.length} detail={`${activeStaff} active`} icon="users"/><VbenMetric label="Active sessions" value={totalSessions} detail="Across loaded staff" icon="lock" tone="success"/><VbenMetric label="Custom roles" value={customRoles} detail={`${roles.length} total roles`} icon="users" tone="primary"/><VbenMetric label="Permissions" value={permissions.length} detail="Platform catalog" icon="check" tone="warning"/></div>
   <VbenAlert tone="info" title="Authorization boundary">System OWNER is protected. Custom roles can only receive permissions the acting merchant is allowed to grant, and self-lockout actions remain blocked.</VbenAlert>
   <VbenTabs value={tab} onChange={setTab} items={tabItems}/>

   {tab==='Staff'&&<VbenCard title="Merchant staff" description="Suspending or disabling an account immediately revokes its active sessions." actions={canStaffManage&&canRolesRead?<VbenButton size="sm" icon="plus" onClick={openCreateStaff}>Create staff</VbenButton>:null}>
    <div className="vben-access-toolbar"><VbenInput icon="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search staff, email, or role"/><span>{filteredStaff.length} of {staff.length}</span></div>
    {!canStaffRead?<VbenAlert tone="warning" title="Staff read permission required">Your role does not include merchant.staff.read.</VbenAlert>:<VbenTable rows={filteredStaff} emptyTitle="No staff accounts" ariaLabel="Merchant staff" columns={[
     {key:'staff',label:'Staff',render:r=><div className="vben-access-person"><span>{(r.display_name||r.email).slice(0,1).toUpperCase()}</span><div><strong>{r.display_name}</strong><small>{r.email}</small></div></div>},
     {key:'status',label:'Status',render:r=><VbenBadge tone={vbenStatusTone(r.status)}>{r.status}</VbenBadge>},
     {key:'roles',label:'Roles',render:r=><div className="vben-access-badges">{(r.roles||[]).map(x=><VbenBadge key={x}>{x}</VbenBadge>)}</div>},
     {key:'sessions',label:'Sessions',render:r=><button className="vben-access-link" onClick={()=>openSessions(r)}>{r.active_sessions||0} active</button>},
     {key:'last',label:'Last login',render:r=><span className="vben-access-date"><VbenDateTime value={r.last_login_at}/></span>},
     {key:'actions',label:'Actions',render:r=><div className="vben-access-row-actions"><VbenButton size="sm" variant="secondary" loading={busy===`staff-${r.id}`} onClick={()=>openEditStaff(r)}>View</VbenButton>{canSessionsManage&&r.id!==session.user.id&&<VbenButton size="sm" variant="ghost" loading={busy===`logout-${r.id}`} onClick={()=>forceLogout(r)}>Force logout</VbenButton>}</div>},
    ]}/>} 
   </VbenCard>}

   {tab==='Roles'&&<VbenCard title="Roles" description="System OWNER is protected. Custom roles can only receive permissions the acting merchant already has." actions={canRolesManage?<VbenButton size="sm" icon="plus" onClick={openCreateRole}>Create role</VbenButton>:null}>
    {!canRolesRead?<VbenAlert tone="warning" title="Role read permission required">Your role does not include merchant.roles.read.</VbenAlert>:<VbenTable rows={roles} emptyTitle="No roles" ariaLabel="Merchant roles" columns={[
     {key:'name',label:'Role',render:r=><div className="vben-access-role"><strong>{r.name}</strong><code>{r.key}</code>{r.description&&<small>{r.description}</small>}</div>},
     {key:'system',label:'Type',render:r=><VbenBadge tone={r.is_system?'success':'neutral'}>{r.is_system?'SYSTEM':'CUSTOM'}</VbenBadge>},
     {key:'staff_count',label:'Staff',render:r=>r.staff_count},
     {key:'permissions',label:'Permissions',render:r=><span>{(r.permissions||[]).length}</span>},
     {key:'actions',label:'Actions',render:r=>r.is_system?<span className="vben-access-protected">Protected</span>:<div className="vben-access-row-actions">{canRolesManage&&<VbenButton size="sm" variant="secondary" onClick={()=>openEditRole(r)}>Edit</VbenButton>}{canRolesManage&&<VbenButton size="sm" variant="danger" loading={busy===`role-${r.id}`} onClick={()=>deleteRole(r)}>Delete</VbenButton>}</div>},
    ]}/>} 
   </VbenCard>}

   {tab==='Permissions'&&<div className="vben-access-permission-columns"><VbenCard title="Effective permissions" description="What your current merchant account can do."><div className="vben-access-permission-grid">{(session.user.permissions||[]).sort().map(p=><code key={p}>{p}</code>)}</div></VbenCard><VbenCard title="Platform permission catalog" description="Permissions available to tenant roles."><div className="vben-access-permission-list">{permissions.map(p=><div key={p.key}><code>{p.key}</code><span>{p.description}</span></div>)}</div></VbenCard></div>}
  </>}

  <VbenModal open={staffModal} onClose={()=>setStaffModal(false)} title="Create merchant staff" size="lg" footer={<><VbenButton variant="secondary" onClick={()=>setStaffModal(false)}>Cancel</VbenButton><VbenButton loading={busy==='create-staff'} disabled={!staffForm.email||!staffForm.display_name||staffForm.password.length<12||!staffForm.role_ids.length} onClick={createStaff}>Create staff</VbenButton></>}>
   <div className="vben-access-form-grid"><VbenField label="Display name"><VbenInput value={staffForm.display_name} onChange={e=>setStaffForm({...staffForm,display_name:e.target.value})}/></VbenField><VbenField label="Email"><VbenInput type="email" value={staffForm.email} onChange={e=>setStaffForm({...staffForm,email:e.target.value})}/></VbenField></div>
   <VbenField label="Initial password" hint="12–128 characters. Share it through a secure channel."><VbenPasswordInput value={staffForm.password} onChange={e=>setStaffForm({...staffForm,password:e.target.value})}/></VbenField>
   <VbenField label="Roles"><div className="vben-access-choice-grid">{allowedRoleOptions.map(r=><label className="vben-access-choice" key={r.id}><input type="checkbox" checked={staffForm.role_ids.includes(r.id)} onChange={()=>setStaffForm({...staffForm,role_ids:toggle(staffForm.role_ids,r.id)})}/><div><strong>{r.name}</strong><span>{r.key} · {(r.permissions||[]).length} permissions</span></div></label>)}</div></VbenField>
  </VbenModal>

  <VbenModal open={Boolean(editStaff)} onClose={()=>setEditStaff(null)} title={editStaff?`Manage ${editStaff.display_name}`:'Manage staff'} size="lg" footer={<><VbenButton variant="secondary" onClick={()=>setEditStaff(null)}>Cancel</VbenButton>{canStaffManage&&<VbenButton loading={busy==='save-staff'} onClick={saveStaff}>Save changes</VbenButton>}</>}>
   {editStaff&&<><div className="vben-access-detail-grid"><div><span>Email</span><strong>{editStaff.email}</strong></div><div><span>Active sessions</span><strong>{editStaff.active_sessions}</strong></div><div><span>Created</span><strong><VbenDateTime value={editStaff.created_at}/></strong></div><div><span>Last login</span><strong><VbenDateTime value={editStaff.last_login_at}/></strong></div></div>
    <VbenField label="Display name"><VbenInput disabled={!canStaffManage} value={editStaffForm.display_name} onChange={e=>setEditStaffForm({...editStaffForm,display_name:e.target.value})}/></VbenField>
    <VbenField label="Status" hint={editStaff.id===session.user.id?'Self suspension/disable is blocked to prevent lockout.':'Non-active status revokes all active sessions.'}><VbenSelect disabled={!canStaffManage||editStaff.id===session.user.id} value={editStaffForm.status} onChange={e=>setEditStaffForm({...editStaffForm,status:e.target.value})}><option>ACTIVE</option><option>SUSPENDED</option><option>DISABLED</option></VbenSelect></VbenField>
    {canRolesManage&&editStaff.id!==session.user.id&&<VbenField label="Roles"><div className="vben-access-choice-grid">{allowedRoleOptions.map(r=><label className="vben-access-choice" key={r.id}><input type="checkbox" checked={editStaffForm.role_ids.includes(r.id)} onChange={()=>setEditStaffForm({...editStaffForm,role_ids:toggle(editStaffForm.role_ids,r.id)})}/><div><strong>{r.name}</strong><span>{r.key}</span></div></label>)}</div></VbenField>}
    <div className="vben-access-danger-zone"><strong>Security actions</strong><span>Password reset revokes every active session for this account.</span><div>{canStaffManage&&editStaff.id!==session.user.id&&<VbenButton variant="secondary" onClick={()=>{setPasswordStaff(editStaff);setNewPassword('')}}>Reset password</VbenButton>}{canSessionsManage&&editStaff.id!==session.user.id&&<VbenButton variant="danger" loading={busy===`logout-${editStaff.id}`} onClick={()=>forceLogout(editStaff)}>Force logout</VbenButton>}<VbenButton variant="secondary" onClick={()=>openSessions(editStaff)}>View sessions</VbenButton></div></div>
   </>}
  </VbenModal>

  <VbenModal open={Boolean(passwordStaff)} onClose={()=>setPasswordStaff(null)} title="Reset staff password" footer={<><VbenButton variant="secondary" onClick={()=>setPasswordStaff(null)}>Cancel</VbenButton><VbenButton variant="danger" loading={busy==='reset-password'} disabled={newPassword.length<12} onClick={resetPassword}>Reset & revoke sessions</VbenButton></>}>
   <VbenAlert tone="warning" title={passwordStaff?.display_name}>All active sessions will be revoked immediately after the password changes.</VbenAlert><VbenField label="New password" hint="12–128 characters"><VbenPasswordInput value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></VbenField>
  </VbenModal>

  <VbenModal open={Boolean(sessionsStaff)} onClose={()=>setSessionsStaff(null)} title={sessionsStaff?`${sessionsStaff.display_name} · Sessions`:'Sessions'} size="xl">
   {sessionsLoading?<VbenSkeleton lines={5}/>:<VbenTable rows={sessions} emptyTitle="No sessions" ariaLabel="Staff sessions" columns={[
    {key:'state',label:'State',render:r=><VbenBadge tone={r.active?'success':'neutral'}>{r.active?'ACTIVE':'REVOKED'}</VbenBadge>},
    {key:'device',label:'Device',render:r=><span className="vben-access-device">{r.user_agent||'Unknown device'}</span>},
    {key:'ip',label:'IP',render:r=>r.request_ip||'—'},
    {key:'seen',label:'Last seen',render:r=><VbenDateTime value={r.last_seen_at}/>},
    {key:'action',label:'',render:r=>r.active&&canSessionsManage&&sessionsStaff?.id!==session.user.id?<VbenButton variant="danger" size="sm" loading={busy===`session-${r.id}`} onClick={()=>revokeSession(r)}>Revoke</VbenButton>:null},
   ]}/>} 
  </VbenModal>

  <VbenModal open={roleModal} onClose={()=>setRoleModal(false)} title={editRole?'Edit role':'Create role'} size="xl" footer={<><VbenButton variant="secondary" onClick={()=>setRoleModal(false)}>Cancel</VbenButton><VbenButton loading={busy==='save-role'} disabled={!roleForm.name||(!editRole&&!roleForm.key)} onClick={saveRole}>{editRole?'Save role':'Create role'}</VbenButton></>}>
   <div className="vben-access-form-grid"><VbenField label="Role key" hint="Uppercase identifier such as ORDER_MANAGER"><VbenInput disabled={Boolean(editRole)} value={roleForm.key} onChange={e=>setRoleForm({...roleForm,key:e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g,'_')})}/></VbenField><VbenField label="Name"><VbenInput value={roleForm.name} onChange={e=>setRoleForm({...roleForm,name:e.target.value})}/></VbenField></div>
   <VbenField label="Description"><VbenTextarea value={roleForm.description} onChange={e=>setRoleForm({...roleForm,description:e.target.value})}/></VbenField>
   <VbenField label="Permissions" hint="The backend blocks assigning permissions you do not possess."><div className="vben-access-permission-choice-grid">{grantablePermissions.map(p=><label className="vben-access-permission-choice" key={p.key}><input type="checkbox" checked={roleForm.permission_keys.includes(p.key)} onChange={()=>setRoleForm({...roleForm,permission_keys:toggle(roleForm.permission_keys,p.key)})}/><div><code>{p.key}</code><span>{p.description}</span></div></label>)}</div></VbenField>
  </VbenModal>
  <VbenToast message={toast} onDone={()=>setToast('')}/>
 </div>;
}
