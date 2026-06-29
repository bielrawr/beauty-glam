const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const getFrontendUrl = (req) => {
  const configuredUrl = process.env.FRONTEND_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

  if (configuredUrl) {
    const url = configuredUrl.startsWith('http') ? configuredUrl : `https://${configuredUrl}`;
    return url.replace(/\/$/, '');
  }

  const requestOrigin = req.get('origin');
  if (requestOrigin) return requestOrigin.replace(/\/$/, '');

  return 'http://localhost:5173';
};

/**
 * Configuração do Mercado Pago utilizando o access token do ambiente ou um fallback de teste.
 */
const client = new MercadoPagoConfig({ 
  accessToken: (process.env.ACCESS_TOKEN || 'TEST-5459450160356503-082716-628acd4c7f83129cb90f7452493f1c05-239398166').trim()
});

/**
 * Rota para criar uma preferência de pagamento no Mercado Pago.
 * Recebe os itens do carrinho e retorna o ID da preferência gerada.
 */
app.post('/create-preference', async (req, res) => {
  try {
    const preference = new Preference(client);
    const frontendUrl = getFrontendUrl(req);
    
    // Versão ultra-simplificada para evitar erros de validação da API
    const response = await preference.create({
      body: {
        items: req.body.items,
        back_urls: {
          success: `${frontendUrl}/order-success`,
          failure: `${frontendUrl}/checkout`,
          pending: `${frontendUrl}/checkout`
        }
      }
    });

    res.json({ id: response.id });
  } catch (error) {
    console.error("Erro detalhado do Mercado Pago:", error);
    res.status(500).json({ 
      message: "Erro ao criar preferência no Mercado Pago",
      error: error.message 
    });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
