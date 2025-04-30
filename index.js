// index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.get('/places', async (req, res) => {
  const { lat, lng, radius = 12000, category } = req.query;

  const categories = {
  'hospitals': {
    type: 'hospital',
    keyword: 'hospital público OR hospital particular OR pronto socorro'
  },
  'clinics': {
    type: 'doctor',
    keyword: 'clínica médica OR clínica geral'
  },
  'government': {
    keyword: 'Poupatempo OR INSS OR Receita Federal OR Polícia OR Polícia Científica OR Procon OR Prefeitura OR Vigilância Sanitária OR Superintendência Estadual'
  },
  'banks': {
    keyword: 'Banco do Brasil OR Caixa Econômica Federal OR BNDES OR Banco da Amazônia OR Banco do Nordeste OR Banestes OR Banrisul OR Bradesco OR Itaú OR Santander OR Banco Safra OR Itaú Unibanco OR BTG Pactual OR Banco Inter OR Banco BMG OR BNP Paribas OR Citibank OR Banco Original OR Banco Intercap OR Crefisa OR Banco Modal OR Sicredi OR Sicoob OR Banco Votorantim OR Banco Mercantil do Brasil'
  },
  'services': {
    keyword: 'AES Sul OR Amazonas Energia OR CEA OR Celesc OR CEMIG OR CER OR CEEE OR CHESP OR Copel OR CSA OR CPFL OR DCEE OR EDP OR Enel OR Energisa OR Equatorial OR Light OR Neoenergia OR Roraima Energia OR SABESP OR COMPESA OR EMBASA OR CASAN OR COPASA OR Sanepar OR CAEMA OR CAGECE OR CAGEPA OR CASAL OR DESO OR Agespisa OR CAERN OR DAE OR DAEP OR SAAE OR Comgás OR Necta Gás OR Naturgy'
  },
  'retail': {
    type: 'store'
  }
};

  const cat = categories[category];
  if (!cat) return res.status(400).json({ error: 'Invalid category' });

  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: radius.toString(),
    key: process.env.GOOGLE_API_KEY,
  });

  if (cat.type) params.append('type', cat.type);
  if (cat.keyword) params.append('keyword', cat.keyword);

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Google Places failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
