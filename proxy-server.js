const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.all('/proxy', async (req, res) => {
  const { url } = req.query;
  const method = req.method;
  const body = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    console.log(`Proxying ${method} request to: ${url}`);
    const response = await axios({
      url,
      method,
      data: body,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000, 
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });

    res.json({
      contents: response.data,
      status: response.status,
    });
  } catch (error) {
    console.error(`Error proxying to ${url}:`, error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      contents: '',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Local proxy server running on http://localhost:${PORT}`);
});
