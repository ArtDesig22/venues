// index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// Approved bank names
const allowedBanks = [
  'Banco do Brasil',
  'Caixa Econômica Federal',
  'Banco Nacional de Desenvolvimento Econômico e Social',
  'Banco da Amazônia',
  'Banco do Nordeste',
  'Banco do Estado do Espírito Santo',
  'Banco do Rio Grande do Sul',
  'Banco Bradesco',
  'Itaú',
  'Banco Santander',
  'Banco Safra',
  'Itaú Unibanco',
  'Santander',
  'BTG Pactual',
  'Banco Inter',
  'Banco BMG',
  'Banco BNP Paribas',
  'Banco Citibank',
  'Banco Original',
  'Banco Intercap',
  'Banco Crefisa',
  'Banco Modal',
  'Sicredi',
  'Sicoob',
  'Banrisul',
  'Banco Votorantim',
  'Banco Mercantil do Brasil'
];

// Approved utility/service providers
const allowedServices = [
  'AES Sul', 'Amazonas Energia', 'Companhia de Eletricidade do Amapá',
  'Centrais Elétricas de Santa Catarina', 'Companhia Energética de Minas Gerais',
  'Companhia Energética de Roraima', 'Companhia Estadual de Distribuição de Energia Elétrica',
  'Companhia Hidroelétrica São Patrício', 'Companhia Paranaense de Energia',
  'Concessionária de Saneamento do Amapá', 'CPFL Energia',
  'Distribuidora Catarinense de Energia Elétrica', 'EDP Brasil',
  'EDP Espírito Santo', 'EDP São Paulo', 'Enel Brasil',
  'Enel Distribuição Ceará', 'Enel Distribuição Rio', 'Enel Distribuição São Paulo',
  'Energisa Acre', 'Energisa Borborema', 'Energisa Mato Grosso',
  'Energisa Mato Grosso do Sul', 'Energisa Minas Gerais', 'Energisa Nova Friburgo',
  'Energisa Rondônia', 'Energisa Sergipe', 'Energisa Sul-Sudeste',
  'Energisa Tocantins', 'Equatorial Energia', 'Equatorial Energia Alagoas',
  'Equatorial Energia Goiás', 'Equatorial Energia Maranhão',
  'Equatorial Energia Pará', 'Equatorial Energia Piauí', 'Grupo Energisa',
  'Light S/A', 'Neoenergia', 'Neoenergia Brasília', 'Neoenergia Coelba',
  'Neoenergia COSERN', 'Neoenergia Elektro', 'Neoenergia Pernambuco',
  'Roraima Energia', 'SABESP', 'COMPESA', 'EMBASA', 'CASAN', 'COPASA',
  'Sanepar', 'CAEMA', 'CAGECE', 'CAGEPA', 'CASAL', 'DESO', 'Agespisa',
  'CAERN', 'DAE', 'DAEP', 'SAAEJ', 'SAAE', 'Comgás', 'Necta Gás', 'Naturgy'
];

// Category mapping
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
    type: 'bank' // Filtered after response
  },
  'services': {
    type: 'establishment' // Filtered after response
  },
  'retail': {
    type: 'store'
  }
};

// API route
app.get('/places', async (req, res) => {
  const { lat, lng, radius = 12000, category } = req.query;

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
    let results = response.data.results || [];

    // Filter banks by approved names
    if (category === 'banks') {
      results = results.filter(place =>
        allowedBanks.some(bank =>
          place.name.toLowerCase().includes(bank.toLowerCase())
        )
      );
    }

    // Filter services by approved agency names
    if (category === 'services') {
      results = results.filter(place =>
        allowedServices.some(service =>
          place.name.toLowerCase().includes(service.toLowerCase())
        )
      );
    }

    res.json({ results });
  } catch (err) {
    console.error('Google Places failed:', err.message);
    res.status(500).json({ error: 'Google Places failed' });
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
