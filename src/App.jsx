import { useState, useEffect } from 'react';
import axios from 'axios';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt!');
      return;
    }
    setLoading(true);
    setCode('');
    setOutput('');
    let attempts = 0;
    const maxRetries = 3;

    while (attempts < maxRetries) {
      attempts++;
      setRetryCount(attempts); // Update retry count
      try {
        const response = await axios.post('https://recursive-ai-executor.onrender.com/execute', { prompt });
        setCode(response.data.final_code || '# No code generated...');
        setOutput(response.data.output || 'No terminal output available.');
        setLogs([
          ...logs,
          {
            prompt,
            code: response.data.final_code,
            output: response.data.output,
            timestamp: new Date().toISOString(),
            retries: attempts,
          },
        ]);
        break; // Exit on success
      } catch (error) {
        console.error('Error on attempt', attempts, ':', error);
        if (attempts === maxRetries) {
          setCode('# Error connecting to backend after max retries...');
          setOutput('Max retries reached. Check backend logs.');
          setLogs([
            ...logs,
            { prompt, code: '# Error', output: 'Max retries reached.', timestamp: new Date().toISOString(), retries: attempts },
          ]);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (code) {
      setTimeout(() => hljs.highlightAll(), 100);
    }
  }, [code]);

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `recursive-ai-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1e1e2f', // Dark rich background
        color: '#ffffff', // White text for readability
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px' }}>Recursive AI Executor</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Enter your prompt:</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write a function to check prime number"
        style={{
          width: '700px',
          height: '120px',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #444',
          backgroundColor: '#2a2a3f',
          color: '#ffffff',
          fontSize: '1.25rem',
          marginBottom: '20px',
          resize: 'none',
        }}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          fontSize: '1.75rem',
          fontWeight: '600',
          padding: '16px 40px',
          borderRadius: '12px',
          marginBottom: '20px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Generating...' : 'Generate Code'}
      </button>
      <div style={{ width: '700px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Generated Code:</h2>
        <pre
          style={{
            backgroundColor: '#2a2a3f',
            color: '#00ff90',
            padding: '16px',
            borderRadius: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            marginBottom: '20px',
          }}
        >
          <code className="language-python">{code}</code>
        </pre>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Terminal Output</h2>
        <pre
          style={{
            backgroundColor: '#1e1e2f',
            color: '#ffffff',
            padding: '16px',
            borderRadius: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            marginBottom: '20px',
          }}
        >
          {output}
        </pre>
        <p style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Retry Attempts: {retryCount}</p>
        <button
          onClick={exportLogs}
          style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: '600',
            padding: '12px 32px',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          Export Logs
        </button>
      </div>
    </div>
  );
}

export default App;
