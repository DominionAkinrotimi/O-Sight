import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, ChevronRight, Shield, TrendingUp, Zap, Eye, Lock, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { AnalysisContext } from '../App.jsx';

const tutorialSteps = [
  { img: '1__login_to_opay.jpeg', text: 'Login to OPay app' },
  { img: '2__click_transaction_history.jpeg', text: 'Click transaction history' },
  { img: '3__click_download.jpeg', text: 'Click download icon' },
  { img: '4__selct_custom_date,_select_the_date_and_confirm.jpeg', text: 'Select custom date & confirm' },
  { img: '5__select_account_and_file_type.jpeg', text: 'Select account & file type' },
  { img: '6__for_file_type,_click_xlxs_not__pdf.jpeg', text: 'Click XLSX (Not PDF)' },
  { img: '7__continue.jpeg', text: 'Click Continue' },
  { img: "8__you'll_be_prompted_to_input_pin,_do_so.jpeg", text: 'Input your PIN' },
  { img: '9__proceed.jpeg', text: 'Click Proceed' },
  { img: '10__Success_modal.jpeg', text: 'Success modal appears' },
  { img: '11__statement_sent_via_mail_almost_immediately.jpeg', text: 'Check your email' },
  { img: '12__click_that_button_to_download_statement.jpeg', text: 'Download the statement!' },
];

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const { setData } = useContext(AnalysisContext);
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bank_type', 'opay');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success === false || !data.profile) {
        setError(data.error || data.detail || 'Failed to analyze statement. Please try again.');
        setLoading(false);
      } else {
        setData(data);
        navigate('/dashboard');
      }
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Navigation */}
      <nav style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #5c7d61 0%, #7c9c81 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white', fontSize: '16px', boxShadow: '0 4px 12px rgba(92, 125, 97, 0.2)' }}>S</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#5c7d61', letterSpacing: '-0.5px' }}>Sight</span>
        </div>
        <a href="https://github.com/DominionAkinrotimi/O-Sight" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#5c7d61', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#7c9c81'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 125, 97, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#5c7d61'; e.currentTarget.style.boxShadow = 'none'; }}>GitHub <ChevronRight size={14} /></a>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Hero Section */}
        <section style={{ marginBottom: '80px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '52px', fontWeight: '800', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '16px', color: '#0f172a', background: 'linear-gradient(135deg, #5c7d61 0%, #7c9c81 70%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your money tells a story.
          </h1>
          <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 48px' }}>
            Stop wondering where your money goes. Upload your bank statement and get instant insights into your spending patterns, financial health, and habits.
          </p>

          {/* Upload Area */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              padding: '48px 40px',
              border: dragOver ? '2px solid #5c7d61' : '2px dashed #cbd5e1',
              borderRadius: '16px',
              background: dragOver ? 'rgba(92, 125, 97, 0.06)' : '#ffffff',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: dragOver ? '0 0 30px rgba(92, 125, 97, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid #cbd5e1', borderTopColor: '#5c7d61', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>Analyzing your statement...</p>
              </div>
            ) : (
              <div>
                <div style={{ width: '60px', height: '60px', background: 'rgba(92, 125, 97, 0.1)', border: '2px solid #cbd5e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', transition: 'all 0.3s ease' }}>
                  <UploadCloud size={28} color="#5c7d61" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Drag your statement here</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>or click to select (Excel files only)</p>
                <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
                  <span style={{ display: 'inline-block', padding: '8px 20px', background: '#5c7d61', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.style.background = '#7c9c81'; e.style.boxShadow = '0 4px 12px rgba(92, 125, 97, 0.3)'; }} onMouseLeave={(e) => { e.style.background = '#5c7d61'; e.style.boxShadow = 'none'; }}>Browse files</span>
                </label>
              </div>
            )}
          </div>

          {error && (
            <div style={{ maxWidth: '520px', margin: '20px auto', padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '13px', color: '#991b1b', margin: 0 }}>{error}</p>
            </div>
          )}
        </section>

        {/* How to Export Section */}
        <section style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '12px', color: '#0f172a', textAlign: 'center' }}>How to export from OPay</h2>
          <p style={{ fontSize: '15px', color: '#475569', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>Follow these simple steps to download your transaction history as an Excel file</p>

          {/* Steps Grid - Interactive */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '40px' }}>
            {tutorialSteps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                onMouseEnter={(e) => { if (activeStep !== idx) e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={(e) => { if (activeStep !== idx) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                style={{
                  padding: '16px 12px',
                  background: activeStep === idx ? '#5c7d61' : '#ffffff',
                  border: activeStep === idx ? 'none' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  boxShadow: activeStep === idx ? '0 4px 16px rgba(92, 125, 97, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: '800', color: activeStep === idx ? 'white' : '#5c7d61', marginBottom: '6px' }}>{idx + 1}</div>
                <p style={{ fontSize: '11px', fontWeight: '600', color: activeStep === idx ? 'white' : '#475569', lineHeight: '1.3' }}>{step.text}</p>
              </div>
            ))}
          </div>

          {/* Active Step Card */}
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#5c7d61', marginBottom: '8px' }}>Step {activeStep + 1} of {tutorialSteps.length}</div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', margin: 0 }}>{tutorialSteps[activeStep].text}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', margin: '8px 0 0' }}>Click the step number or navigate through the list above</p>
          </div>
        </section>

        {/* Why Choose Section */}
        <section>
          <h2 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '48px', color: '#0f172a', textAlign: 'center' }}>Why Sight?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { icon: Eye, title: 'Complete Visibility', desc: 'See exactly where your money goes across every merchant and category with clear, visual breakdowns.' },
              { icon: TrendingUp, title: 'Actionable Insights', desc: 'Get smart, personalized recommendations to improve your financial habits and save more.' },
              { icon: Shield, title: 'Your Privacy First', desc: 'Data analyzed locally on your device and deleted instantly. We never store or access your statements.' },
              { icon: Zap, title: 'Instant Analysis', desc: 'Upload and get complete insights in seconds, not hours. Powered by fast, local processing.' },
              { icon: FileSpreadsheet, title: 'Multi-Bank Ready', desc: 'Currently supporting OPay with Interswitch, Palmpay, and more coming soon.' },
              { icon: Lock, title: 'Secure & Safe', desc: 'Bank-grade security standards to protect your sensitive financial information every step.' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '28px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(92, 125, 97, 0.12)';
                  e.currentTarget.style.borderColor = '#5c7d61';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ width: '48px', height: '48px', background: 'rgba(92, 125, 97, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <item.icon size={24} color="#5c7d61" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{ padding: '32px', textAlign: 'center', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          Made with care. Your data, your rules. <a href="https://github.com/DominionAkinrotimi/O-Sight" style={{ color: '#5c7d61', textDecoration: 'none', fontWeight: '600' }}>Open source</a>.
        </p>
      </footer>

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          nav {
            padding: 16px 20px !important;
          }
          h1 {
            font-size: 36px !important;
            line-height: 1.2 !important;
          }
          h2 {
            font-size: 28px !important;
          }
          p {
            font-size: 14px !important;
          }
          section {
            margin-bottom: 60px !important;
          }
        }
        @media (max-width: 480px) {
          nav {
            padding: 12px 16px !important;
          }
          h1 {
            font-size: 28px !important;
            line-height: 1.15 !important;
          }
          h2 {
            font-size: 22px !important;
          }
          p {
            font-size: 13px !important;
          }
          section {
            margin-bottom: 40px !important;
          }
          div[style*="grid"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
