'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogin } from '@/lib/api';
import { useTheme } from '@/components/theme-provider';
import { Shield, Eye, EyeOff, Sun, Moon, Users, ShieldCheck, Mic, MicOff } from 'lucide-react';

const roles = [
  { id: 'VIEWER', name: 'Viewer', icon: Users, color: 'blue' },
  { id: 'ANALYST', name: 'Analyst', icon: ShieldCheck, color: 'purple' },
  { id: 'ADMIN', name: 'Admin', icon: Shield, color: 'red' },
];

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const { theme, toggleTheme } = useTheme();
  const recognitionRef = useRef(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('VIEWER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState(null);
  
  // Voice input handler
  const startVoiceInput = (field) => {
    // If already listening to this field, stop
    if (activeVoiceField === field && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    
    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser. Please use Chrome or Edge.');
      setError('Voice input not supported. Use Chrome or Edge.');
      return;
    }
    
    // Set listening state immediately for visual feedback
    setIsListening(true);
    setActiveVoiceField(field);
    setError('');
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (field === 'email') {
        // Convert "at" to @ and "dot" to .
        setEmail(transcript.replace(/\s+/g, '').toLowerCase().replace(/at/gi, '@').replace(/dot/gi, '.'));
      } else if (field === 'password') {
        setPassword(transcript.replace(/\s+/g, ''));
      }
      setIsListening(false);
      setActiveVoiceField(null);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setActiveVoiceField(null);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone in browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Click mic and speak.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError(`Voice error: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setActiveVoiceField(null);
      recognitionRef.current = null;
    };
    
    try {
      recognition.start();
    } catch (err) {
      setError('Failed to start voice input. Please try again.');
      setIsListening(false);
      setActiveVoiceField(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await loginMutation.mutateAsync({ email, password });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };
  
  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-lg btn-3d"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600" />
        )}
      </button>
      
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-3xl text-white">IFCS</h1>
              <p className="text-sm text-white/70">Intelligent Finance Control System</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h2 className="text-5xl font-bold text-white leading-tight">
            Take control of your<br />
            <span className="text-white/80">financial future</span>
          </h2>
          <p className="text-lg text-white/70 max-w-md">
            AI-powered insights, role-based access control, and real-time analytics 
            to help you make smarter financial decisions.
          </p>
          
          <div className="flex items-center gap-8 pt-4">
            <div className="card-3d bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-sm text-white/60">Accuracy</p>
            </div>
            <div className="card-3d bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-sm text-white/60">Transactions</p>
            </div>
            <div className="card-3d bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-white/60">Monitoring</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-white/50">
            © 2024 IFCS. Secure financial management.
          </p>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl gradient-text">IFCS</h1>
              <p className="text-sm text-[var(--text-muted)]">Finance Control</p>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome back</h2>
            <p className="text-[var(--text-secondary)]">
              Sign in to your account to continue
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">
              {error}
            </div>
          )}
          
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Login as</label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 btn-3d ${
                    selectedRole === r.id
                      ? r.color === 'blue' 
                        ? 'border-blue-500 bg-blue-500/10'
                        : r.color === 'purple'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-red-500 bg-red-500/10'
                      : 'border-[var(--border)] hover:border-[var(--primary)] bg-[var(--surface-1)]'
                  }`}
                >
                  <r.icon className={`w-5 h-5 mx-auto mb-1 ${
                    selectedRole === r.id
                      ? r.color === 'blue' ? 'text-blue-500' : r.color === 'purple' ? 'text-purple-500' : 'text-red-500'
                      : 'text-[var(--text-muted)]'
                  }`} />
                  <p className={`font-medium text-xs ${selectedRole === r.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {r.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pr-12"
                  placeholder="you@example.com"
                  required
                />
                <button
                  type="button"
                  onClick={() => startVoiceInput('email')}
                  className={`absolute right-3 p-1.5 rounded-lg transition-all ${
                    activeVoiceField === 'email' 
                      ? 'text-white bg-red-500 animate-pulse' 
                      : 'text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-2)]'
                  }`}
                  title="Click to speak"
                >
                  {activeVoiceField === 'email' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-20"
                  placeholder="••••••••"
                  required
                />
                <div className="absolute right-3 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startVoiceInput('password')}
                    className={`p-1.5 rounded-lg transition-all ${
                      activeVoiceField === 'password' 
                        ? 'text-white bg-red-500 animate-pulse' 
                        : 'text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-2)]'
                    }`}
                    title="Click to speak"
                  >
                    {activeVoiceField === 'password' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary btn-3d w-full py-3 text-lg font-semibold"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <p className="text-center mt-6 text-[var(--text-secondary)]">
            {"Don't have an account? "}
            <Link href="/register" className="text-[var(--primary)] hover:underline font-medium">
              Sign up
            </Link>
          </p>
          
          {/* Voice instruction */}
          {isListening && (
            <div className="mt-4 p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-center animate-pulse">
              <p className="text-sm text-[var(--primary)] font-medium">
                🎤 Listening... Speak now
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
