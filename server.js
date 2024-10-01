import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const GITHUB_API_URL = 'https://api.github.com';

async function fetchGitHubData(url, token) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!response.ok) {
    throw new Error(`GitHub API responded with status ${response.status}`);
  }
  return response.json();
}

app.get('/api/commits', async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    const userData = await fetchGitHubData(`${GITHUB_API_URL}/user`, token);
    const username = userData.login;

    const xDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const searchQuery = `author:${username} author-date:>${xDaysAgo}`;
    const searchUrl = `${GITHUB_API_URL}/search/commits?q=${encodeURIComponent(searchQuery)}`;

    const searchData = await fetchGitHubData(searchUrl, token);
    const commitCount = searchData.total_count;

    res.json({ commitCount, username });
  } catch (error) {
    console.error('Error fetching commit data:', error);
    res.status(500).json({ error: 'Error fetching commit data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});