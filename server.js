import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const GITHUB_API_URL = 'https://api.github.com';

app.get('/api/commits', async (req, res) => {
  try {
    const username = req.query.username;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const since = new Date();
    since.setDate(since.getDate() - 1);

    console.log(`Fetching events for ${username} since: ${since.toISOString()}`);

    const eventsResponse = await fetch(`${GITHUB_API_URL}/users/${username}/events?per_page=100&since=${since.toISOString()}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!eventsResponse.ok) {
      throw new Error(`GitHub API responded with status ${eventsResponse.status}`);
    }

    const eventsData = await eventsResponse.json();
    console.log(`Total events fetched: ${eventsData.length}`);

    const numDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pushEvents = eventsData.filter(event => 
      event.type === 'PushEvent' && new Date(event.created_at) > numDayAgo
    );
    console.log(`Push events: ${pushEvents.length}`);

    const commitCount = pushEvents.reduce((total, event) => total + event.payload.commits.length, 0);
    console.log(`Total commit count: ${commitCount}`);

    res.json({ commitCount, username });
  } catch (error) {
    console.error('Error fetching commit data:', error);
    res.status(500).json({ error: 'Error fetching commit data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
