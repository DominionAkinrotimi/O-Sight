import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Shield, HelpCircle, CheckCircle2, Lock, FileSpreadsheet, Search, AlertTriangle, Code } from 'lucide-react';
import { AnalysisContext } from '../App.jsx';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const mockChartData = [
  { day: 'Mon', spend: 400 },
  { day: 'Tue', spend: 300 },
  { day: 'Wed', spend: 550 },
  { day: 'Thu', spend: 200 },
  { day: 'Fri', spend: 700 },
  { day: 'Sat', spend: 850 },
  { day: 'Sun', spend: 450 },
];

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
      <section style={{ padding: '60px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Left Side: Text and CTA */}
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '64px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px' }}>
              Stop guessing where your money goes.
            </h1>
            
            <p style={{ fontSize: '20px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '40px' }}>
              Upload your bank statement. Get a complete, instant audit of your spending, saving, and financial health.
            </p>

            {/* Clear Call to Action (Upload Zone) */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid rgba(226, 232, 240, 0.8)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green)', fontSize: '13px', fontWeight: '700', background: '#dcfce7', padding: '6px 16px', borderRadius: '100px', border: '1px solid #bbf7d0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Lock size={14} /> 
                <span>Analyzed locally. Deleted instantly.</span>
              </div>

              <div
                style={{
                  border: dragOver ? '2px dashed var(--accent)' : '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: dragOver ? '#f0fdf4' : '#f8fafc',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '12px'
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !loading && document.getElementById('file-upload').click()}
              >
                <input type="file" id="file-upload" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileChange} disabled={loading} />
                
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Analyzing Statement...</h3>
                  </div>
                ) : (
                  <div>
                    <div style={{ width: '56px', height: '56px', background: 'white', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <UploadCloud size={24} color="var(--accent)" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Upload statement (Excel)</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>Drag & drop or click</p>
                  </div>
                )}
              </div>
              
              {error && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AlertTriangle size={16} />
                  <div><strong>Error:</strong> {error}</div>
                </div>
              )}
              
              <div style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: '500', lineHeight: '1.5' }}>
                Supported: <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>OPay first</span> (Other banks will come in soon!)
                <div style={{ marginTop: '8px', padding: '8px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}>
                  📱 Note: Mobile responsiveness will also be incorporated soon.
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Mock Chart Dashboard */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 24px 60px rgba(0,0,0,0.08)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>Total Weekly Spend</h4>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>₦ 3,450.00</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', color: 'var(--accent)', padding: '8px 16px', borderRadius: '100px', fontWeight: '700', fontSize: '14px' }}>-12% vs last week</div>
            </div>

            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: '600' }}
                    itemStyle={{ color: 'var(--accent)' }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}>Top Merchant</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>U</div>
                  <div style={{ fontSize: '15px', fontWeight: '700' }}>Uber</div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}>Largest Category</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--bg-primary)', borderRadius: '50%', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}><Search size={16}/></div>
                  <div style={{ fontSize: '15px', fontWeight: '700' }}>Transport</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '60px 48px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>What you'll discover</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>We turn messy rows of transactions into clear, undeniable truths.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', marginTop: '60px' }}>
            
            {/* Feature 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(92, 125, 97, 0.1)', color: 'var(--accent)', marginBottom: '24px' }}>
                  <Search size={32} />
                </div>
                <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>Merchant Breakdown</h3>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>See exactly who you sent money to, neatly grouped. No more guessing what "TRANSFER TO 12345" means.</p>
              </div>
              <div style={{ flex: '1 1 400px', height: '320px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', borderRadius: '32px', border: '1px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '80%' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                     <span style={{ fontWeight: '800', fontSize: '16px' }}>Uber</span><span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>12 Transactions</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                     <span style={{ fontWeight: '800', fontSize: '16px' }}>Netflix</span><span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>1 Transaction</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ fontWeight: '800', fontSize: '16px' }}>Spotify</span><span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>1 Transaction</span>
                   </div>
                 </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '24px' }}>
                  <AlertTriangle size={32} />
                </div>
                <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>Anomaly Detection</h3>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>We automatically flag unusual spending spikes, unexpected duplicate charges, and new vendors you haven't seen before.</p>
              </div>
              <div style={{ flex: '1 1 400px', height: '320px', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', borderRadius: '32px', border: '1px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(239,68,68,0.15)', width: '85%', borderLeft: '4px solid #ef4444' }}>
                   <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                     <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px' }}><AlertTriangle color="#ef4444" size={24} /></div>
                     <div>
                       <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>Duplicate Charge</div>
                       <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Spotify - ₦ 900.00 twice in 24h</div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', marginBottom: '24px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>Precision Accuracy</h3>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>We correctly subtract internal sweeps between your own accounts to give you true income and expense totals without inflation.</p>
              </div>
              <div style={{ flex: '1 1 400px', height: '320px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '32px', border: '1px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(59,130,246,0.1)', width: '80%' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Raw Expenses</span><span style={{ fontWeight: '800', color: '#ef4444' }}>₦ 150,000</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Internal Sweeps</span><span style={{ fontWeight: '800', color: '#3b82f6' }}>- ₦ 50,000</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ fontWeight: '800', fontSize: '18px' }}>Actual Spend</span><span style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '18px' }}>₦ 100,000</span>
                   </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How to get statement */}
      <section id="how-it-works" style={{ padding: '100px 48px', background: 'transparent' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>How to get your statement</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Follow these quick steps in the OPay app to get your XLSX statement:</p>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '32px', scrollSnapType: 'x mandatory' }}>
            {tutorialSteps.map((step, idx) => (
              <div key={idx} style={{ minWidth: '240px', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', scrollSnapAlign: 'start', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '9/16', background: '#f1f5f9' }}>
                  <img src={`/howto/${step.img}`} alt={`Step ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: idx === 2 ? 'contain' : 'cover', background: idx === 2 ? '#f1f5f9' : 'transparent', padding: idx === 2 ? '36px 8px 8px 8px' : '0' }} />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                    {idx + 1}
                  </div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center', lineHeight: '1.4' }}>
                  {step.text}
                </div>
              </div>
            ))}
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
