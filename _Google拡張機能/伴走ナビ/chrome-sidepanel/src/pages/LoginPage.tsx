import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useState } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // モックのため認証処理はスキップし、メイン機能(AI校正)へ遷移
    navigate('/correction');
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--bg-color)',
      backgroundImage: 'radial-gradient(var(--primary-light) 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'var(--primary-color)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'white'
          }}>
            <LogIn size={32} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>伴走ナビ (HUG版)</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            アカウント情報を入力してログインしてください
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="label">メールアドレス</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label" style={{ margin: 0 }}>パスワード</label>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
                パスワードを忘れた場合
              </a>
            </div>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem' }}>
            ログイン
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
          © 2026 伴走ナビ. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
