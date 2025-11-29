const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // It's highly recommended to use environment variables for your API key
  const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

  // Forward query parameters from the client to the Ticketmaster API
  const queryString = new URL(req.url, `http://${req.headers.host}`).search;

  const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json${queryString}&apikey=${TICKETMASTER_API_KEY}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      // Forward the error status from Ticketmaster
      return res.status(response.status).json({ error: 'Error fetching data from Ticketmaster' });
    }
    const data = await response.json();
    
    // Set cache headers
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Ticketmaster API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
