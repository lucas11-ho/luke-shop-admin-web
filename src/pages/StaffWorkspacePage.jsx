import React,{useEffect,useMemo}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';
import{resolveStaffWorkspaces}from'../staff/workspaces.js';

export function StaffWorkspacePage(){
  const{session,logout}=useAuth();
  const workspaces=useMemo(()=>resolveStaffWorkspaces(session?.user),[session?.user]);
  useEffect(()=>{if(workspaces.length===1)navigate(workspaces[0].route)},[workspaces]);
  const name=session?.user?.display_name||session?.user?.email||'Staff';
  if(workspaces.length===1)return <div className="staff-workspace-page"><div className="staff-workspace-loading"><span className="staff-workspace-mark">L</span><strong>Opening {workspaces[0].title}</strong><p>Your authenticated role resolves to one operational workspace.</p></div></div>;
  return <div className="staff-workspace-page"><header className="staff-workspace-header"><div><span className="staff-workspace-mark">L</span><div><strong>Luke Shop Staff</strong><small>{session?.tenantSlug||'Tenant'} · {name}</small></div></div><button type="button" onClick={()=>logout('/staff-login')}>Sign out</button></header><main className="staff-workspace-main"><div className="staff-workspace-intro"><span>Staff Operations</span><h1>Choose your workspace</h1><p>Only workspaces granted by your authenticated roles and permissions are shown. Business authority remains enforced by the Backend on every request.</p></div>{workspaces.length?<div className="staff-workspace-grid">{workspaces.map(workspace=><button className="staff-workspace-card" type="button" key={workspace.key} onClick={()=>navigate(workspace.route)}><span className="staff-workspace-card-index">{String(workspaces.indexOf(workspace)+1).padStart(2,'0')}</span><strong>{workspace.title}</strong><p>{workspace.description}</p><b>Open workspace →</b></button>)}</div>:<div className="staff-workspace-empty"><strong>No operational workspace assigned</strong><p>Ask the merchant administrator to assign a supported Driver, Kitchen or Cashier role.</p></div>}<div className="staff-workspace-note"><strong>Preparation boundary</strong><span>This route is intentionally isolated from the Merchant Admin shell so the same modules can be extracted into the dedicated Staff Web application without changing Backend commerce authority.</span></div></main></div>;
}
