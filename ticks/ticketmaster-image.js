const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl query parameter is required' });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    const imageBuffer = await response.buffer();
    res.setHeader('Content-Type', response.headers.get('content-type'));
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
