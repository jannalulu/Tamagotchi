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
    // Fetch authenticated user's information
    const userResponse = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub API responded with status ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const username = userData.login;

    const since = new Date();
    since.setDate(since.getDate() - 30); // Get commits from the last 30 days

    const eventsResponse = await fetch(`${GITHUB_API_URL}/users/${username}/events?per_page=100&since=${since.toISOString()}`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!eventsResponse.ok) {
      throw new Error(`GitHub API responded with status ${eventsResponse.status}`);
    }

    const eventsData = await eventsResponse.json();
    const pushEvents = eventsData.filter(event => event.type === 'PushEvent');
    const commitCount = pushEvents.reduce((total, event) => total + event.payload.commits.length, 0);

    res.json({ commitCount, username });
  } catch (error) {
    console.error('Error fetching commit data:', error);
    res.status(500).json({ error: 'Error fetching commit data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});