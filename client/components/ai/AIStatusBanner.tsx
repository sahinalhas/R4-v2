
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';

export function AIStatusBanner() {
  const { data: status } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => apiClient.get('/api/ai-status/status', { showErrorToast: false }),
    refetchInterval: 30000
  });

  if (!status?.isActive) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>AI Asistan Aktif Değil</AlertTitle>
        <AlertDescription>
          AI özelliklerini kullanmak için lütfen <a href="/ayarlar" className="underline font-medium">Ayarlar</a> bölümünden AI sağlayıcısını yapılandırın.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-900">AI Asistan Aktif</AlertTitle>
      <AlertDescription className="text-green-800">
        {status.providerName} ile çalışıyor 
        <Badge variant="outline" className="ml-2">{status.model}</Badge>
      </AlertDescription>
    </Alert>
  );
}
