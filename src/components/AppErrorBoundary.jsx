import React from 'react';

const SESSION_KEY='luke-shop-admin.session.v1';

export class AppErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={failed:false};}
  static getDerivedStateFromError(){return{failed:true};}
  componentDidCatch(){
    try{console.error('Merchant Admin rendering failed. Use the recovery screen to reload or sign in again.');}catch{}
  }
  reload=()=>{window.location.reload();};
  signIn=()=>{
    try{sessionStorage.removeItem(SESSION_KEY);}catch{}
    window.location.hash='#/login';
    window.location.reload();
  };
  render(){
    if(!this.state.failed)return this.props.children;
    return <main className="app-fatal-error" role="alert" aria-live="assertive">
      <section className="app-fatal-error-card">
        <div className="app-fatal-error-mark" aria-hidden="true">!</div>
        <span className="app-fatal-error-eyebrow">Merchant Admin recovery</span>
        <h1>This workspace could not be displayed.</h1>
        <p>The page encountered an unexpected client-side rendering error. No error details or session data are exposed here.</p>
        <div className="app-fatal-error-actions">
          <button type="button" className="app-fatal-primary" onClick={this.reload}>Reload workspace</button>
          <button type="button" className="app-fatal-secondary" onClick={this.signIn}>Return to sign in</button>
        </div>
      </section>
    </main>;
  }
}
