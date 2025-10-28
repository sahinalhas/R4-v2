import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api/api-client';
import { USER_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { ApiResponse } from '@/lib/types/api-types';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'counselor' as 'admin' | 'counselor' | 'teacher' | 'observer',
    institution: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Ad Soyad gereklidir';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Ad Soyad en az 3 karakter olmalıdır';
    }

    if (!formData.email.trim()) {
      errors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.password) {
      errors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (!formData.institution.trim()) {
      errors.institution = 'Kurum adı gereklidir';
    } else if (formData.institution.trim().length < 3) {
      errors.institution = 'Kurum adı en az 3 karakter olmalıdır';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiClient.post<ApiResponse>(
        USER_ENDPOINTS.BASE,
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
          institution: formData.institution.trim()
        },
        {
          showErrorToast: false, // We'll handle errors manually
        }
      );

      if (result && 'success' in result && result.success) {
        navigate('/login', { 
          state: { 
            message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.',
            email: formData.email.trim().toLowerCase()
          } 
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kayıt yapılırken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const roleDescriptions = {
    admin: 'Tüm sistem yetkilerine sahip',
    counselor: 'Rehber öğretmen - Tüm öğrenci verilerine erişim',
    teacher: 'Öğretmen - Kendi sınıflarına erişim',
    observer: 'Gözlemci - Sadece genel raporlara erişim'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">R360</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Yeni Hesap Oluştur</CardTitle>
          <CardDescription>
            Rehber360'a katılın ve dijital rehberlik sistemini kullanmaya başlayın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Ad Soyad <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                  className={validationErrors.name ? 'border-destructive' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-destructive">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  E-posta <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@okul.edu.tr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className={validationErrors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Şifre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  className={validationErrors.password ? 'border-destructive' : ''}
                  autoComplete="new-password"
                />
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Şifre Tekrar <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  className={validationErrors.confirmPassword ? 'border-destructive' : ''}
                  autoComplete="new-password"
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">
                Kurum Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="institution"
                type="text"
                placeholder="Örnek İlkokulu"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                disabled={isLoading}
                className={validationErrors.institution ? 'border-destructive' : ''}
              />
              {validationErrors.institution && (
                <p className="text-sm text-destructive">{validationErrors.institution}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Rol <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'counselor' | 'teacher' | 'observer') => 
                  setFormData({ ...formData, role: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Rol seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="counselor">Rehber Öğretmen</SelectItem>
                  <SelectItem value="teacher">Öğretmen</SelectItem>
                  <SelectItem value="admin">Yönetici</SelectItem>
                  <SelectItem value="observer">Gözlemci</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {roleDescriptions[formData.role]}
              </p>
            </div>

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
              {isLoading ? 'Kaydediliyor...' : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Hesap Oluştur
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Zaten hesabınız var mı?
              </span>
            </div>
          </div>

          <Link to="/login">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Giriş Yap
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
