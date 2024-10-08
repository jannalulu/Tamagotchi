import React, { useState, useEffect } from 'react';

interface GitHubTamagotchiProps {}

const GitHubTamagotchi: React.FC<GitHubTamagotchiProps> = () => {
  const [commits, setCommits] = useState<number>(0);
  const [stage, setStage] = useState<number>(0);
  const [frame, setFrame] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchCommits = async (): Promise<void> => {
    try {
      const response = await fetch('/api/commits');
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
    const interval = setInterval(fetchCommits, 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStage(Math.min(Math.floor(commits / 10), 2));
  }, [commits]);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % 2);
    }, 500);
    return () => clearInterval(animationInterval);
  }, []);

  const pixelArt: string[][] = [
    // Egg
    [
      `
   ▄▄██▄▄
  ██░░░░██
  ██░░░░██
  ██░░░░██
   ▀▀██▀▀
    `,
      `
   ▄▄██▄▄
  ██▒▒▒▒██
  ██▒▒▒▒██
  ██▒▒▒▒██
   ▀▀██▀▀
    `
    ],
    // Child
    [
      `
   ▄▄██▄▄
  ██▓▓▓▓██
  ██●  ●██
   ██  ██
    ▀██▀
   ▄█  █▄
    `,
      `
   ▄▄██▄▄
  ██▓▓▓▓██
  ██-  -██
   ██  ██
    ▀██▀
   ▄█  █▄
    `
    ],
    // Adult
    [
      `
  ▐▀▄   ▄▀▌
  ██▓█▌█▓██
  ██▄█▀█▄██
   ▄▀▄██▄▀▄
  █  █▀▀█  █
     ▀  ▀
    `,
      `
  ▐▀▄   ▄▀▌
  ██-█▌█-██
  ██▄█▀█▄██
   ▄▀▄██▄▀▄
  █  █▀▀█  █
     ▀  ▀
    `
    ]
  ];

  return (
    <div style={{padding: '20px', margin: '20px'}}>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <p>Commits: {commits}</p>
      <p>Stage: {stage}</p>
      <h2>GitHub Tamagotchi</h2>
      {/*username && <p>GitHub User: {username}</p>*/}
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
        stage === 0 ? "Keep committing to hatch the egg!" :
        stage === 1 ? "Your creature is growing!" :
        "Your creature is thriving!"
      }</p>
    </div>
  );
};

export default GitHubTamagotchi;
