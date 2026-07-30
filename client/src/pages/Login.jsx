import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#FAF9F7]">
      {/* Left signature panel - angled gradient, hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#6C5CE7] via-[#8B5CF6] to-[#FF6B4A]">
        <div
          className="absolute -right-24 top-0 h-full w-2/3 bg-[#FAF9F7]"
          style={{ clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight">
            HRMS
          </div>
          <div>
            <h2 className="font-['Space_Grotesk'] text-4xl font-bold leading-tight mb-4">
              People, payroll,
              <br />
              and time off —
              <br />
              in one place.
            </h2>
            <p className="text-white/80 max-w-sm">
              Manage your team, approve leave, and run payroll without the spreadsheets.
            </p>
          </div>
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} HRMS</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden font-['Space_Grotesk'] text-2xl font-bold text-[#14132B] mb-8 text-center">
            HRMS
          </div>

          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#14132B] mb-1">
            Welcome back
          </h1>
          <p className="text-[#6B7280] mb-8">Log in to your account to continue.</p>

          {error && (
            <div className="bg-[#FFF0ED] border border-[#FF6B4A]/30 text-[#C0442B] text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#14132B] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full border border-[#E5E3F1] bg-white rounded-xl px-4 py-2.5 text-[#14132B] placeholder:text-[#B0AEC2] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#14132B] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-[#E5E3F1] bg-white rounded-xl px-4 py-2.5 text-[#14132B] placeholder:text-[#B0AEC2] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C5CE7] text-white font-medium py-2.5 rounded-xl hover:bg-[#5B4BD6] active:scale-[0.98] transition disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-[#6C5CE7]/25"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;