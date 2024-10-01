import React, { useState, useEffect } from 'react';

interface GitHubTamagotchiProps {}

const GitHubTamagotchi: React.FC<GitHubTamagotchiProps> = () => {
  const [commits, setCommits] = useState<number>(0);
  const [stage, setStage] = useState<number>(0);
  const [frame, setFrame] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchUsername, setSearchUsername] = useState<string>('');

  const fetchCommits = async (user?: string): Promise<void> => {
    if (!user) {
      setError(null);
      return;
    }
    try {
      const response = await fetch(`/api/commits?username=${user}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: { commitCount: number, username: string } = await response.json();
      setCommits(data.commitCount);
      setUsername(data.username);
      setError(null);
    } catch (err) {
      console.error('Error fetching commit data:', err);
      setError('Error fetching commit data. Please try again later.');
    }
  };

  useEffect(() => {
    fetchCommits();
    const interval = setInterval(() => fetchCommits(), 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStage(Math.min(Math.floor(commits / 10), 5));
  }, [commits]);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % 2);
    }, 500);
    return () => clearInterval(animationInterval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      fetchCommits(searchUsername.trim());
    } else {
      setError('Please enter a GitHub username');
    }
  };
  const pixelArt: string[][] = [
    // Egg
    [
      `
   ▄▄██▄▄
  ██░░░░██
  ██░✿✿░██
  ██░░░░██
   ▀▀██▀▀
    `,
      `
   ▄▄██▄▄
  ██▒▒▒▒██
  ██˛♥♥˛██
  ██▒▒▒▒██
   ▀▀██▀▀
    `
    ],
    // Baby
    [
      `
   ▄▄██▄▄
  ██▓▓▓▓██
  ██◕ω◕██
   ██ ‿ ██
    ▀██▀
   ▄█  █▄
    `,
      `
   ▄▄██▄▄
  ██▓▓▓▓██
  ██⊙ω⊙██
   ██ ‿ ██
    ▀██▀
   ▄█  █▄
    `
    ],
    // Child
    [
      `
    ▄██▄
   ██▓▓██
  ██●ㅅ●██
  ██    ██
   ██  ██
    ▀██▀
   ▄█  █▄
    `,
      `
    ▄██▄
   ██▓▓██
  ██☆ㅅ☆██
  ██  ω ██
   ██  ██
    ▀██▀
   ▄█  █▄
    `
    ],
    // Teen
    [
      `
   ▄███▄
  ██▓▓▓██
 ██◕  ◕██
 ██  ㅅ ██
  ██   ██
   ▀███▀
  ▄█▀ ▀█▄
    `,
      `
   ▄███▄
  ██▓▓▓██
 ██⊙  ⊙██
 ██  ω ██
  ██   ██
   ▀███▀
  ▄█▀ ▀█▄
    `
    ],
    // Adult 
    [
      ` 
  ▐▀▄   ▄▀▌
  ██◕▽◕██
  ██▄█▀█▄██
   ▄▀▄██▄▀▄
  █  █▼▼█  █
     ▀  ▀
    `,
      `
  ▐▀▄   ▄▀▌
  ██⊙▽⊙██
  ██▄█▀█▄██
   ▄▀▄██▄▀▄
  █  █▼▼█  █
     ▀  ▀
    `
    ],
    // Elder
    [
      `
   ▄▄█████▄▄
  ██▓▓▓▓▓▓▓██
 ██ ◕  ◡  ◕ ██
 ██   ▼▼▼   ██
  ██▄▄   ▄▄██
    ▀█████▀
   ▄█▀   ▀█▄
    `,
      `
   ▄▄█████▄▄
  ██▓▓▓▓▓▓▓██
 ██ ⊙  ◡  ⊙ ██
 ██   ▼▼▼   ██
  ██▄▄   ▄▄██
    ▀█████▀
   ▄█▀   ▀█▄
    `
    ],
  ];

  return (
    <div style={{padding: '20px', margin: '20px'}}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          placeholder="Enter GitHub username"
        />
        <button type="submit">Search</button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <p>Commits: {commits}</p>
      <p>Stage: {stage}</p>
      <h2>GitHub Tamagotchi</h2>
      {username && <p>GitHub User: {username}</p>}
      <pre style={{
        fontFamily: 'monospace',
        fontSize: '20px',
        lineHeight: '1',
        whiteSpace: 'pre',
        textAlign: 'center',
        display: 'inline-block'
      }}>
        {pixelArt[stage][frame]}
      </pre>
      <p>{
        stage === 0 ? "Keep contributing to hatch the egg!" :
        stage === 1 ? "Your creature is a baby!" :
        stage === 2 ? "Your creature is growing into a child!" :
        stage === 3 ? "Your creature is growing into a teen!" :
        stage === 4 ? "Your creature is thriving" :
        "Your creature is wise and mature!"
      }</p>
    </div>
  );
};

export default GitHubTamagotchi;
