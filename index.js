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
    type: 'bank'
  },
  'services': {
    keyword: 'companhia elétrica OR agência de água OR agência de gás OR concessionária de energia'
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
