import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { CheckCircle2, Home, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AssessmentComplete() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <Card className="text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <CardTitle className="text-3xl">Tebrikler!</CardTitle>
          
          <CardDescription className="text-lg">
            Anketi başarıyla tamamladınız
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-2">
            <h3 className="font-semibold text-blue-900">Sonraki Adımlar</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left list-disc list-inside">
              <li>Cevaplarınız AI tarafından analiz edilecek</li>
              <li>Rehber öğretmeniniz sonuçları inceleyecek</li>
              <li>Onaylanan bilgiler profilinize eklenecek</li>
              <li>Bu süreç genellikle 1-2 gün sürmektedir</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/self-assessments')}
              className="w-full"
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Diğer Anketlere Dön
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Ana Sayfaya Git
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Ankete katıldığınız için teşekkür ederiz! Cevaplarınız bize yardımcı olacak.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
