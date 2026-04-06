'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister } from '@/lib/api';
import { useTheme } from '@/components/theme-provider';
import { Shield, Eye, EyeOff, CheckCircle, Users, ShieldCheck, Sun, Moon, Mic, MicOff } from 'lucide-react';

const roles = [
  { id: 'VIEWER', name: 'Viewer', description: 'View dashboard and reports', icon: Users, color: 'blue' },
  { id: 'ANALYST', name: 'Analyst', description: 'View records and insights', icon: ShieldCheck, color: 'purple' },
  { id: 'ADMIN', name: 'Admin', description: 'Full access to manage everything', icon: Shield, color: 'red' },
];

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const { theme, toggleTheme } = useTheme();
  const recognitionRef = useRef(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState(null);
  
  // Voice input handler
  const startVoiceInput = (field) => {
    // If already listening, stop
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
      if (field === 'name') {
        setName(transcript);
      } else if (field === 'email') {
        // Remove spaces and convert to lowercase for email
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
  
  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }
    
    try {
      await registerMutation.mutateAsync({ email, password, name, role });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-40 right-20 w-64 h-64 rounded-full bg-white blur-3xl animate-pulse" />
          <div className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-white blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white">IFCS</h1>
              <p className="text-sm text-white/70">Intelligent Finance Control System</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Start your journey to<br />
            <span className="text-white/80">financial wellness</span>
          </h2>
          <p className="text-lg text-white/70 max-w-md">
            Join thousands of users who trust IFCS for intelligent financial 
            tracking and AI-powered insights.
          </p>
          
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-white/80">
              <CheckCircle className="w-5 h-5 text-white" />
              <span>Role-based access control</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <CheckCircle className="w-5 h-5 text-white" />
              <span>AI-powered anomaly detection</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <CheckCircle className="w-5 h-5 text-white" />
              <span>Financial health scoring</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-white/50">
            © 2024 IFCS. Secure financial management.
          </p>
        </div>
      </div>
      
      {/* Right side - Register form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl gradient-text">IFCS</h1>
              <p className="text-sm text-[var(--text-muted)]">Finance Control</p>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Create account</h2>
            <p className="text-[var(--text-secondary)]">
              Get started with your financial journey
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Voice Listening Indicator - Show at top when listening */}
            {isListening && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-red-500/20 border-2 border-red-500 animate-pulse">
                <div className="relative">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute" />
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                </div>
                <span className="text-red-500 font-semibold">🎤 Listening for {activeVoiceField}... Speak now!</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Full Name</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pr-14"
                  placeholder="John Doe"
                  required
                  minLength={2}
                />
                <button
                  type="button"
                  onClick={() => startVoiceInput('name')}
                  className={`absolute right-2 p-2 rounded-lg transition-all duration-200 ${
                    activeVoiceField === 'name' 
                      ? 'text-white bg-red-500 shadow-lg shadow-red-500/50 scale-110' 
                      : 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10'
                  }`}
                  title="Click to speak your name"
                >
                  {activeVoiceField === 'name' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pr-14"
                  placeholder="you@example.com"
                  required
                />
                <button
                  type="button"
                  onClick={() => startVoiceInput('email')}
                  className={`absolute right-2 p-2 rounded-lg transition-all duration-200 ${
                    activeVoiceField === 'email' 
                      ? 'text-white bg-red-500 shadow-lg shadow-red-500/50 scale-110' 
                      : 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10'
                  }`}
                  title="Click to speak (say 'john at gmail dot com')"
                >
                  {activeVoiceField === 'email' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
                  className="input-field pr-24"
                  placeholder="••••••••"
                  required
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startVoiceInput('password')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      activeVoiceField === 'password' 
                        ? 'text-white bg-red-500 shadow-lg shadow-red-500/50 scale-110' 
                        : 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10'
                    }`}
                    title="Click to speak password"
                  >
                    {activeVoiceField === 'password' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* Password requirements */}
              <div className="mt-2 grid grid-cols-2 gap-1">
                <p className={`text-xs flex items-center gap-1 ${hasMinLength ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle className="w-3 h-3" />
                  8+ characters
                </p>
                <p className={`text-xs flex items-center gap-1 ${hasUppercase ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle className="w-3 h-3" />
                  Uppercase
                </p>
                <p className={`text-xs flex items-center gap-1 ${hasLowercase ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle className="w-3 h-3" />
                  Lowercase
                </p>
                <p className={`text-xs flex items-center gap-1 ${hasNumber ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                  <CheckCircle className="w-3 h-3" />
                  Number
                </p>
              </div>
            </div>
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Select Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 btn-3d bg-[var(--surface-1)] ${
                      role === r.id
                        ? r.color === 'blue' 
                          ? 'border-blue-500 bg-blue-500/10'
                          : r.color === 'purple'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-red-500 bg-red-500/10'
                        : 'border-[var(--border)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <r.icon className={`w-5 h-5 mx-auto mb-1 ${
                      role === r.id
                        ? r.color === 'blue' ? 'text-blue-500' : r.color === 'purple' ? 'text-purple-500' : 'text-red-500'
                        : 'text-[var(--text-muted)]'
                    }`} />
                    <p className={`font-medium text-xs ${role === r.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {r.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={registerMutation.isPending || !isPasswordValid}
              className="btn-primary w-full py-3 disabled:opacity-50 btn-3d"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <p className="text-center mt-6 text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
