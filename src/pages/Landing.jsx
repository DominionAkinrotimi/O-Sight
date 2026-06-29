import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Menu, X, AlertTriangle } from 'lucide-react';
import { AnalysisContext } from '../App.jsx';

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', color: '#ffffff' }}>
      
      {/* Navigation Bar */}
      <nav style={{ padding: 'clamp(16px, 4vw, 20px) clamp(16px, 5vw, 48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: '#000' }}>O</div>
          <span style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>SIGHT</span>
        </div>

        {/* Desktop Nav Links */}
        <div style={{ display: 'none', gap: 'clamp(24px, 3vw, 40px)', fontSize: '14px', fontWeight: '500', color: '#a1a1a1', alignItems: 'center' }} className="desktop-nav">
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
          <a href="https://github.com/DominionAkinrotimi/O-Sight" target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'none' }}>GitHub</a>
        </div>

        {/* Mobile Menu Button */}
        <button style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#ffffff' }} className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ background: 'rgba(10, 10, 10, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <a href="#features" style={{ color: '#a1a1a1', textDecoration: 'none', fontSize: '14px' }} onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="https://github.com/DominionAkinrotimi/O-Sight" target="_blank" rel="noreferrer" style={{ color: '#a1a1a1', textDecoration: 'none', fontSize: '14px' }}>GitHub</a>
        </div>
      )}

      {/* Hero Section */}
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px, 8vw, 80px) clamp(20px, 5vw, 48px)' }}>
        <div style={{ maxWidth: '900px', width: '100%', textAlign: 'center' }}>
          
          {/* Subtitle */}
          <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: '600', color: '#ec4899', marginBottom: '24px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Financial Analytics
          </div>

          {/* Main Headline */}
          <h1 style={{ fontSize: 'clamp(36px, 10vw, 72px)', fontWeight: '900', color: '#ffffff', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px' }}>
            Understand Your Money
          </h1>

          {/* Subheading */}
          <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', color: '#a1a1a1', lineHeight: '1.6', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
            Upload your bank statement and get instant insights into your spending, saving patterns, and financial health in seconds.
          </p>

          {/* Upload Zone */}
          <div style={{ background: '#111111', border: '2px solid #333333', borderRadius: 'clamp(20px, 4vw, 28px)', padding: 'clamp(32px, 6vw, 48px)', marginBottom: '32px', transition: 'all 0.3s ease', cursor: loading ? 'not-allowed' : 'pointer' }} 
            onDragOver={(e) => { e.preventDefault(); if (!loading) setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !loading && document.getElementById('file-upload').click()}
            style={{
              background: dragOver ? '#1a2a1a' : '#111111',
              border: dragOver ? '2px solid #ec4899' : '2px solid #333333',
              borderRadius: 'clamp(20px, 4vw, 28px)',
              padding: 'clamp(32px, 6vw, 48px)',
              marginBottom: '32px',
              transition: 'all 0.3s ease',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <input type="file" id="file-upload" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileChange} disabled={loading} />
            
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid #333333', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <h3 style={{ fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: '700', color: '#ffffff' }}>Analyzing your statement...</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', background: '#1a1a1a', border: '2px solid #333333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UploadCloud size={32} color="#ec4899" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Drag and drop your Excel file</h3>
                  <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: '#a1a1a1' }}>or click to browse</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Text */}
          <p style={{ fontSize: 'clamp(12px, 2.5vw, 13px)', color: '#737373', marginBottom: '16px' }}>
            🔒 <span style={{ color: '#a1a1a1' }}>Analyzed locally. Never stored. Your data stays private.</span>
          </p>

          {/* Error Message */}
          {error && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div><strong>Error:</strong> {error}</div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 48px)', background: '#111111', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Section Title */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 60px)' }}>
            <h2 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: '900', color: '#ffffff', marginBottom: '16px', letterSpacing: '-1px' }}>
              Powerful Analytics
            </h2>
            <p style={{ fontSize: 'clamp(16px, 3vw, 18px)', color: '#a1a1a1' }}>
              Turn transaction chaos into clear financial insights
            </p>
          </div>

          {/* Features Grid - Colorful Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 3vw, 24px)' }}>
            
            {/* Feature Card 1 - Pink */}
            <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.05) 100%)', border: '1px solid #ec4899', borderRadius: '20px', padding: 'clamp(24px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📊</div>
              <div>
                <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Spending Breakdown</h3>
                <p style={{ fontSize: 'clamp(14px, 2.5vw, 15px)', color: '#a1a1a1', lineHeight: '1.6' }}>See exactly where your money goes across merchants and categories.</p>
              </div>
            </div>

            {/* Feature Card 2 - Blue */}
            <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid #3b82f6', borderRadius: '20px', padding: 'clamp(24px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎯</div>
              <div>
                <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Anomaly Detection</h3>
                <p style={{ fontSize: 'clamp(14px, 2.5vw, 15px)', color: '#a1a1a1', lineHeight: '1.6' }}>Automatically flag duplicate charges, unusual spending, and new merchants.</p>
              </div>
            </div>

            {/* Feature Card 3 - Orange */}
            <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid #f59e0b', borderRadius: '20px', padding: 'clamp(24px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💡</div>
              <div>
                <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Smart Insights</h3>
                <p style={{ fontSize: 'clamp(14px, 2.5vw, 15px)', color: '#a1a1a1', lineHeight: '1.6' }}>Get actionable recommendations to optimize your spending and save more.</p>
              </div>
            </div>

            {/* Feature Card 4 - Green */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid #10b981', borderRadius: '20px', padding: 'clamp(24px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📈</div>
              <div>
                <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Trend Analysis</h3>
                <p style={{ fontSize: 'clamp(14px, 2.5vw, 15px)', color: '#a1a1a1', lineHeight: '1.6' }}>Track spending patterns over time and identify trends that matter.</p>
              </div>
            </div>

            {/* Feature Card 5 - Purple */}
            <div style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(167, 139, 250, 0.05) 100%)', border: '1px solid #a78bfa', borderRadius: '20px', padding: 'clamp(24px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🔒</div>
              <div>
                <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Privacy First</h3>
                <p style={{ fontSize: 'clamp(14px, 2.5vw, 15px)', color: '#a1a1a1', lineHeight: '1.6' }}>All analysis happens locally. Your data is never stored on our servers.</p>
              </div>
            </div>

            {/* Feature Card 6 - Red */}
            <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)', border: '1px solid #ef4444', borderRadius: '20px', padding: 'clamp(24px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>⚡</div>
              <div>
                <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Lightning Fast</h3>
                <p style={{ fontSize: 'clamp(14px, 2.5vw, 15px)', color: '#a1a1a1', lineHeight: '1.6' }}>Get complete analysis in seconds. No waiting, no delays.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 48px)', background: '#0a0a0a', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: '900', color: '#ffffff', marginBottom: '16px', letterSpacing: '-1px' }}>
            Ready to understand your finances?
          </h2>
          <p style={{ fontSize: 'clamp(16px, 3vw, 18px)', color: '#a1a1a1', marginBottom: '32px', lineHeight: '1.6' }}>
            Start your financial journey. Upload your statement now and get instant insights.
          </p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: '#ec4899', color: '#000', border: 'none', padding: 'clamp(12px, 2vw, 16px) clamp(32px, 4vw, 48px)', borderRadius: '12px', fontSize: 'clamp(14px, 2.5vw, 16px)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            Get Started →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: 'clamp(24px, 4vw, 40px) clamp(20px, 5vw, 48px)', background: '#111111', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#737373' }}>
          © 2024 O-Sight. All rights reserved. <a href="https://github.com/DominionAkinrotimi/O-Sight" target="_blank" rel="noreferrer" style={{ color: '#ec4899', textDecoration: 'none' }}>GitHub</a>
        </p>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
