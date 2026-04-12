import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiArrowLeft, FiRefreshCw, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import toast from 'react-hot-toast';
import './Login.css';

// Reusable password input with show/hide toggle
function PasswordInput({ value, onChange, placeholder = '••••••••' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="password-wrap">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
      <button type="button" className="pw-toggle" onClick={() => setShow(s => !s)} tabIndex={-1}>
        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  );
}

// Step 1: Login form
function LoginForm({ onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate(params.get('redirect') || (data.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label><FiMail /> Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
      </div>
      <div className="form-group">
        <label><FiLock /> Password</label>
        <PasswordInput value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      </div>
      <button type="submit" className="btn-primary login-btn" disabled={loading}>
        {loading ? 'Signing in...' : 'Login'}
      </button>
      <div className="login-links">
        <button type="button" className="forgot-link" onClick={() => onSwitch('forgot')}>
          Forgot Password?
        </button>
      </div>
      <p className="login-footer">
        Don't have an account? <button type="button" onClick={() => onSwitch('register')}>Register</button>
      </p>
    </form>
  );
}

// Step 2: Register form
function RegisterForm({ onSwitch, onRegistered }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters with a letter and a number');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Verification code sent to your email!');
      onRegistered(form.email);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label><FiUser /> Full Name</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
      </div>
      <div className="form-group">
        <label><FiMail /> Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
      </div>
      <div className="form-group">
        <label><FiPhone /> Phone</label>
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+61 4XX XXX XXX" />
      </div>
      <div className="form-group">
        <label><FiLock /> Password</label>
        <PasswordInput value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 chars, include a number" />
      </div>
      <button type="submit" className="btn-primary login-btn" disabled={loading}>
        {loading ? 'Sending code...' : 'Create Account'}
      </button>
      <p className="login-footer">
        Already have an account? <button type="button" onClick={() => onSwitch('login')}>Login</button>
      </p>
    </form>
  );
}

// Step 3: OTP Verification
function OTPForm({ email, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const updated = [...otp];
    updated[idx] = val.slice(-1);
    setOtp(updated);
    // Auto focus next
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter the 6-digit code');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp: code });
      login(data);
      toast.success('Email verified! Welcome to Everest Auto Hub!');
      navigate(params.get('redirect') || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('New code sent!');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    }
    setResending(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="otp-info">
        <div className="otp-icon">📧</div>
        <p>We sent a 6-digit code to</p>
        <strong>{email}</strong>
      </div>

      <div className="otp-inputs" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(e.target.value, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            className="otp-box"
            autoFocus={i === 0}
          />
        ))}
      </div>

      <button type="submit" className="btn-primary login-btn" disabled={loading}>
        {loading ? 'Verifying...' : '✅ Verify Email'}
      </button>

      <div className="otp-resend">
        {countdown > 0 ? (
          <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Resend code in {countdown}s</p>
        ) : (
          <button type="button" className="resend-btn" onClick={handleResend} disabled={resending}>
            <FiRefreshCw size={13} /> {resending ? 'Sending...' : 'Resend Code'}
          </button>
        )}
      </div>

      <button type="button" className="back-btn" onClick={onBack}>
        <FiArrowLeft size={14} /> Back to Register
      </button>
    </form>
  );
}

// Forgot Password — 3 steps: email → OTP → new password
function ForgotPassword({ onBack }) {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ newPw: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState({ new: false, confirm: false });

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset code sent! Check your inbox and spam folder.');
      setStep('otp');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset code';
      toast.error(msg);
      // Don't advance to OTP step on error
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter the 6-digit code');
    setLoading(true);
    try {
      await api.post('/auth/verify-reset-otp', { email, otp: code });
      toast.success('Code verified!');
      setStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
      setOtp(['', '', '', '', '', '']);
    }
    setLoading(false);
  };

  // Step 3: Set new password
  const handleReset = async (e) => {
    e.preventDefault();
    if (passwords.newPw.length < 6) return toast.error('Password must be at least 6 characters');
    if (passwords.newPw !== passwords.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp: otp.join(''), newPassword: passwords.newPw });
      toast.success('Password reset successfully! Please login.');
      onBack();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const updated = [...otp];
    updated[idx] = val.slice(-1);
    setOtp(updated);
    if (val && idx < 5) document.getElementById(`rotp-${idx + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) document.getElementById(`rotp-${idx - 1}`)?.focus();
  };

  return (
    <div>
      {/* Step indicators */}
      <div className="forgot-steps">
        {['Email', 'Verify Code', 'New Password'].map((s, i) => (
          <div key={i} className={`forgot-step ${['email','otp','reset'].indexOf(step) >= i ? 'active' : ''}`}>
            <span>{i + 1}</span>
            <small>{s}</small>
          </div>
        ))}
      </div>

      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp}>
          <p className="forgot-desc">Enter your registered email and we'll send you a reset code.</p>
          <div className="form-group">
            <label><FiMail /> Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Sending...' : '📧 Send Reset Code'}
          </button>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp}>
          <div className="otp-info">
            <div className="otp-icon">🔐</div>
            <p>Reset code sent to</p>
            <strong>{email}</strong>
          </div>
          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input key={i} id={`rotp-${i}`} type="text" inputMode="numeric"
                maxLength={1} value={digit} className="otp-box" autoFocus={i === 0}
                onChange={e => handleOtpChange(e.target.value, i)}
                onKeyDown={e => handleOtpKeyDown(e, i)}
              />
            ))}
          </div>
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Verifying...' : '✅ Verify Code'}
          </button>
          <div className="otp-resend">
            <button type="button" className="resend-btn" onClick={handleSendOtp}>
              <FiRefreshCw size={13} /> Resend Code
            </button>
          </div>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 'reset' && (
        <form onSubmit={handleReset}>
          <p className="forgot-desc">Choose a strong new password for your account.</p>
          <div className="form-group">
            <label><FiLock /> New Password</label>
            <PasswordInput value={passwords.newPw} onChange={e => setPasswords(p => ({ ...p, newPw: e.target.value }))} placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label><FiLock /> Confirm Password</label>
            <PasswordInput value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
            {passwords.newPw && passwords.confirm && (
              <small className={passwords.newPw === passwords.confirm ? 'pw-match-hint' : 'pw-nomatch-hint'}>
                {passwords.newPw === passwords.confirm ? <><FiCheck size={12} /> Passwords match</> : '✗ Passwords do not match'}
              </small>
            )}
          </div>
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Resetting...' : '🔒 Reset Password'}
          </button>
        </form>
      )}

      <button type="button" className="back-btn" style={{ marginTop: '1rem' }} onClick={onBack}>
        <FiArrowLeft size={14} /> Back to Login
      </button>
    </div>
  );
}

// Main Login page
export default function Login() {
  const [step, setStep] = useState('login'); // 'login' | 'register' | 'verify'
  const [pendingEmail, setPendingEmail] = useState('');

  const handleRegistered = (email) => {
    setPendingEmail(email);
    setStep('verify');
  };

  const handleSwitch = (newStep, email = '') => {
    if (email) setPendingEmail(email);
    setStep(newStep);
  };

  const titles = {
    login: 'Welcome Back',
    register: 'Create Account',
    verify: 'Verify Email',
    forgot: 'Reset Password',
  };

  return (
    <div className="login-page">
      <div className="login-box card">
        <div className="login-logo">
          <BrandLogo size="lg" />
        </div>

        {(step === 'login' || step === 'register') && (
          <div className="login-tabs">
            <button className={step === 'login' ? 'active' : ''} onClick={() => setStep('login')}>Login</button>
            <button className={step === 'register' ? 'active' : ''} onClick={() => setStep('register')}>Register</button>
          </div>
        )}

        <h3 className="login-title">{titles[step]}</h3>

        {step === 'login' && <LoginForm onSwitch={handleSwitch} />}
        {step === 'register' && <RegisterForm onSwitch={handleSwitch} onRegistered={handleRegistered} />}
        {step === 'verify' && <OTPForm email={pendingEmail} onBack={() => setStep('register')} />}
        {step === 'forgot' && <ForgotPassword onBack={() => setStep('login')} />}
      </div>
    </div>
  );
}
