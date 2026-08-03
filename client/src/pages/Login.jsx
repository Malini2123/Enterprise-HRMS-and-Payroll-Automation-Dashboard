import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, FileText, Users, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen flex bg-[#FAF7F2]">
      {/* Left illustration panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Organic blob shapes */}
        <div
          className="absolute w-[480px] h-[480px] bg-[#E9E1F7]"
          style={{
            borderRadius: '58% 42% 68% 32% / 45% 55% 45% 55%',
            top: '-60px',
            left: '-80px',
          }}
        />
        <div
          className="absolute w-64 h-64 bg-[#DCEBDC]"
          style={{
            borderRadius: '42% 58% 35% 65% / 60% 40% 60% 40%',
            bottom: '-20px',
            right: '20px',
          }}
        />
        <div
          className="absolute w-32 h-32 bg-[#F5DEDD]"
          style={{
            borderRadius: '65% 35% 55% 45% / 45% 55% 45% 55%',
            top: '80px',
            right: '60px',
          }}
        />

        {/* Floating icon cards */}
        <div className="relative z-10 w-full max-w-md px-12">
          <div className="bg-white rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] p-5 mb-4 flex items-center gap-4 -rotate-2">
            <div className="w-11 h-11 rounded-2xl bg-[#F0EBFA] flex items-center justify-center shrink-0">
              <Users size={20} className="text-[#A594D1]" />
            </div>
            <div>
              <p className="font-['Poppins'] font-semibold text-[#4A4458] text-sm">Team Management</p>
              <p className="text-[#8B8698] text-xs">Onboard & organize with ease</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] p-5 mb-4 flex items-center gap-4 rotate-1 ml-8">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF3EA] flex items-center justify-center shrink-0">
              <CalendarClock size={20} className="text-[#6B8F6B]" />
            </div>
            <div>
              <p className="font-['Poppins'] font-semibold text-[#4A4458] text-sm">Leave Tracking</p>
              <p className="text-[#8B8698] text-xs">Request & approve in seconds</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] p-5 flex items-center gap-4 -rotate-1">
            <div className="w-11 h-11 rounded-2xl bg-[#FBF1E1] flex items-center justify-center shrink-0">
              <FileText size={20} className="text-[#C09A52]" />
            </div>
            <div>
              <p className="font-['Poppins'] font-semibold text-[#4A4458] text-sm">Payslips</p>
              <p className="text-[#8B8698] text-xs">Access anytime, anywhere</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div
          className="absolute w-72 h-72 bg-[#F0EBFA]/60 -z-0"
          style={{
            borderRadius: '48% 52% 62% 38% / 42% 48% 52% 58%',
            top: '10%',
            right: '-100px',
          }}
        />

        <div className="w-full max-w-sm relative z-10">
          <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-2xl bg-[#A594D1] flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-['Poppins'] font-semibold text-lg text-[#4A4458]">HRMS</span>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EDE8F5] p-8">
            <h1 className="font-['Poppins'] text-2xl font-semibold text-[#4A4458] mb-1">
              Welcome back
            </h1>
            <p className="text-[#8B8698] text-sm mb-6">
              Log in to your HRMS account
            </p>

            {error && (
              <div className="bg-[#FAEBEA] text-[#C97F76] text-sm px-4 py-2.5 rounded-2xl mb-5 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4458] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full border border-[#EDE8F5] bg-[#FAF7F2] rounded-2xl px-4 py-2.5 text-[#4A4458] placeholder:text-[#B5B0C2] focus:outline-none focus:ring-2 focus:ring-[#A594D1]/40 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4458] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-[#EDE8F5] bg-[#FAF7F2] rounded-2xl px-4 py-2.5 text-[#4A4458] placeholder:text-[#B5B0C2] focus:outline-none focus:ring-2 focus:ring-[#A594D1]/40 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A594D1] text-white font-medium py-2.5 rounded-2xl hover:bg-[#9482C4] active:scale-[0.98] transition disabled:opacity-50 mt-2"
              >
                {loading ? 'Logging in…' : 'Log in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;