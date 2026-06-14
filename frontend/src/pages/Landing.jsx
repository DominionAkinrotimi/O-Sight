import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Shield, HelpCircle, CheckCircle2, Lock, FileSpreadsheet, Search, AlertTriangle, Code } from 'lucide-react';
import { AnalysisContext } from '../App.jsx';

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const { setData } = useContext(AnalysisContext);
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bank_type', 'opay');

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Analysis failed. Make sure it is a valid OPay statement.');
      setData(result);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const scrollToUpload = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Navigation */}
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 12px rgba(92, 125, 97, 0.2)' }}>
            O
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>O-Sight</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>How it Works</a>
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
          <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy</a>
          <a href="https://github.com/DominionAkinrotimi/O-Sight" target="_blank" rel="noreferrer" style={{ background: '#1e293b', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s' }}>
            <Code size={16} /> GitHub
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '120px 24px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        
        <h1 style={{ fontSize: '72px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2.5px', maxWidth: '800px' }}>
          Stop guessing where your money goes.
        </h1>
        
        <p style={{ fontSize: '22px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '60px', maxWidth: '600px' }}>
          Upload your bank statement. Get a complete, instant audit of your spending, saving, and financial health.
        </p>

        {/* Clear Call to Action (Upload Zone) */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 24px 50px rgba(0,0,0,0.08)', border: '1px solid rgba(226, 232, 240, 0.8)', width: '100%', maxWidth: '600px', position: 'relative' }}>
          
          <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green)', fontSize: '13px', fontWeight: '700', background: '#dcfce7', padding: '8px 20px', borderRadius: '100px', border: '1px solid #bbf7d0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Lock size={14} /> 
            <span>Analyzed locally. Deleted instantly.</span>
          </div>

          <div
            style={{
              border: dragOver ? '2px dashed var(--accent)' : '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
              background: dragOver ? '#f0fdf4' : '#f8fafc',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '16px'
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !loading && document.getElementById('file-upload').click()}
          >
            <input type="file" id="file-upload" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileChange} disabled={loading} />
            
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Analyzing Statement...</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>Uncovering your spending patterns</p>
              </div>
            ) : (
              <div>
                <div style={{ width: '64px', height: '64px', background: 'white', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(0,0,0,0.04)' }}>
                  <UploadCloud size={28} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Upload your statement (Excel)</h3>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '12px' }}>Drag and drop here, or click to browse.</p>
              </div>
            )}
          </div>
          
          {error && (
            <div style={{ marginTop: '24px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px', textAlign: 'left' }}>
              <AlertTriangle size={18} />
              <div><strong>Error:</strong> {error}</div>
            </div>
          )}
          
          <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: '500' }}>
            Supported: <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>OPay for now </span> (Other banks coming soon!)
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 48px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>What you'll discover</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>We turn messy rows of transactions into clear, undeniable truths.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ color: 'var(--accent)', background: 'var(--bg-primary)', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}><Search size={28} /></div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Merchant Breakdown</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>See exactly who you sent money to, neatly grouped. No more guessing what "TRANSFER TO 12345" means.</p>
            </div>
            
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ color: 'var(--red)', background: 'var(--red-bg)', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}><AlertTriangle size={28} /></div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Anomaly Detection</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>We automatically flag unusual spending spikes, unexpected duplicate charges, and new vendors.</p>
            </div>
            
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ color: 'var(--blue)', background: 'var(--blue-bg)', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}><CheckCircle2 size={28} /></div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Precision Accuracy</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>We correctly subtract internal sweeps between your own accounts to give you true income and expense totals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to get statement */}
      <section id="how-it-works" style={{ padding: '100px 48px', background: 'transparent' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>How to get your statement</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '48px' }}>Currently optimized specifically for OPay formats:</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'left' }}>
            <div style={{ padding: '32px', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>1</div>
              <div style={{ fontSize: '16px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>Open the OPay app and navigate to the <strong>Me</strong> tab.</div>
            </div>
            <div style={{ padding: '32px', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>2</div>
              <div style={{ fontSize: '16px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>Tap on <strong>Account Statement</strong> and select your desired date range.</div>
            </div>
            <div style={{ padding: '32px', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>3</div>
              <div style={{ fontSize: '16px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>Select <strong>Excel (.xlsx)</strong> format (Not PDF), download, and upload here.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" style={{ padding: '100px 48px', background: '#1e293b', color: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', color: '#34d399', marginBottom: '32px' }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-1px' }}>Privacy First. Truly.</h2>
          <p style={{ fontSize: '20px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px' }}>
            We are not a bank. We do not sell data. We don't even have a database. Your data is analyzed locally in memory and disappears instantly when you refresh.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <CheckCircle2 color="#34d399" size={24} />
               <span style={{ fontSize: '16px', fontWeight: '600' }}>No account required</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <CheckCircle2 color="#34d399" size={24} />
               <span style={{ fontSize: '16px', fontWeight: '600' }}>No database storage</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <CheckCircle2 color="#34d399" size={24} />
               <span style={{ fontSize: '16px', fontWeight: '600' }}>100% Open source</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '80px 48px', background: 'var(--bg-primary)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>Ready to uncover your financial truth?</h2>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px' }}>Upload your OPay statement in seconds. (Other banks coming soon)</p>
        <button 
          onClick={scrollToUpload}
          style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(92, 125, 97, 0.3)', transition: 'transform 0.2s', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <UploadCloud size={20} /> Upload OPay Statement
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 48px', textAlign: 'center', background: '#0f172a', color: '#64748b', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>Built with transparency by ODT Labs.</div>
        <a href="https://github.com/DominionAkinrotimi/O-Sight" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={16} /> View Source
        </a>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        html { scroll-behavior: smooth; }
      `}} />
    </div>
  );
}
