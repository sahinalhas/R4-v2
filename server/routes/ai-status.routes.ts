import { Router } from 'express';
import { getAIProviderService } from '../services/ai-provider.service.js';

const router = Router();

router.get('/status', async (_req, res) => {
  try {
    const aiService = getAIProviderService();
    const provider = aiService.getProvider();
    const model = aiService.getModel();
    
    // Provider'ın gerçekten kullanılabilir olup olmadığını kontrol et
    const isAvailable = await aiService.isAvailable();
    
    const status = {
      isActive: isAvailable,
      provider: provider,
      model: model,
      providerName: provider === 'gemini' ? 'Gemini' : 
                    provider === 'openai' ? 'OpenAI' : 
                    provider === 'ollama' ? 'Ollama' : provider,
      status: isAvailable ? 'healthy' : 'unavailable'
    };
    
    res.json(status);
  } catch (error) {
    res.json({
      isActive: false,
      provider: null,
      model: null,
      providerName: 'Devre Dışı',
      status: 'error'
    });
  }
});

export default router;
