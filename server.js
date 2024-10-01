import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const GITHUB_API_URL = 'https://api.github.com';
const DAYS_TO_COUNT = 14;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.get('/api/commits', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const eventsResponse = await fetch(`${GITHUB_API_URL}/users/${username}/events?per_page=100`, {
      headers: headers
    });

    if (!eventsResponse.ok) {
      if (eventsResponse.status === 403) {
        const rateLimitResponse = await fetch(`${GITHUB_API_URL}/rate_limit`, { headers });
        const rateLimitData = await rateLimitResponse.json();
        console.log('Rate limit data:', rateLimitData);
        throw new Error(`GitHub API rate limit exceeded. Reset at ${new Date(rateLimitData.rate.reset * 1000)}`);
      }
      throw new Error(`GitHub API responded with status ${eventsResponse.status}`);
    }

    const eventsData = await eventsResponse.json();
    console.log(`Total events fetched: ${eventsData.length}`);

    const numDaysAgo = new Date(Date.now() - DAYS_TO_COUNT * 24 * 60 * 60 * 1000);
    
    const commitCount = eventsData.reduce((total, event) => {
      if (event.type === 'PushEvent' && new Date(event.created_at) > numDaysAgo) {
        return total + event.payload.commits.length;
      }
      return total;
    }, 0);

    console.log(`Total commit count in the last ${DAYS_TO_COUNT} days: ${commitCount}`);

    res.json({ commitCount, username });
  } catch (error) {
    console.error('Error fetching commit data:', error);
    res.status(500).json({ error: error.message || 'Error fetching commit data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});