import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Rocket, UserPlus } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { message?: string; email?: string };
    if (state?.message) {
      setSuccessMessage(state.message);
      if (state.email) {
        setEmail(state.email);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/');
      } else {
        setError('E-posta veya şifre hatalı.');
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await quickDemoLogin();
      navigate('/');
    } catch (err) {
      setError('Demo girişi yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">R360</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Rehber360'a Hoş Geldiniz</CardTitle>
          <CardDescription>
            MEB uyumlu dijital rehberlik yönetimi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@okul.edu.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>

            {successMessage && (
              <Alert className="border-green-500 bg-green-50 text-green-900">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Giriş Yap
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                veya
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleQuickDemo}
            disabled={isLoading}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Demo ile Hızlı Giriş
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Demo hesabı: <span className="font-mono">rehber@okul.edu.tr</span>
          </p>

          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hesabınız yok mu?
              </span>
            </div>
          </div>

          <Link to="/register" className="mt-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Hesap Oluştur
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
