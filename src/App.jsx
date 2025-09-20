import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Modern, interview-ready theme
import { saveAs } from 'file-saver';

function App() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const codeRef = useRef(null);

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
      setRetryCount(attempts);

      try {
        const response = await axios.post(
          'https://recursive-ai-executor-backend.onrender.com/execute',
          { prompt }
        );

        setCode(response.data.final_code || '# No code generated...');
        setOutput(response.data.output || 'No terminal output available.');
        setLogs((prevLogs) => [
          ...prevLogs,
          {
            prompt,
            code: response.data.final_code,
            output: response.data.output,
            timestamp: new Date().toISOString(),
            retries: attempts
          }
        ]);
        break; // Exit on success
      } catch (error) {
        console.error('Error on attempt', attempts, ':', error);
        if (attempts === maxRetries) {
          setCode('# Error connecting to backend after max retries...');
          setOutput('Max retries reached. Check backend logs.');
          setLogs((prevLogs) => [
            ...prevLogs,
            {
              prompt,
              code: '# Error',
              output: 'Max retries reached.',
              timestamp: new Date().toISOString(),
              retries: attempts
            }
          ]);
        }
      }
    }

    setLoading(false);
  };

  // Highlight code when it changes
  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    saveAs(blob, `recursive-ai-logs-${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4"
      style={{ backgroundColor: '#1e1e2f', color: '#f0f0f0', fontFamily: 'Inter, sans-serif' }}
    >
      <h1 className="text-3xl font-bold mb-6">Recursive AI Executor</h1>
      <p className="text-lg mb-2">Enter your prompt:</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write a function to check prime number"
        className="border border-gray-600 px-4 py-2 w-[700px] mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={6}
        style={{ borderRadius: '1rem', fontSize: '1.25rem', backgroundColor: '#2b2b3c', color: '#f0f0f0' }}
      />
      <div>
        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition"
          style={{ marginTop: '18px', padding: '16px 40px', fontSize: '28px', width: '300px' }}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Code'}
        </button>
      </div>

      <div className="mt-6 w-[700px]">
        <h2 className="text-xl font-semibold mb-2">Generated Code (Read-Only)</h2>
        <pre className="bg-gray-900 p-4 rounded-md text-left text-sm font-mono w-full whitespace-pre-wrap overflow-x-auto shadow-lg">
          <code ref={codeRef} className="language-python">
            {code}
          </code>
        </pre>

        <h2 className="text-xl font-semibold mt-4 mb-2">Terminal Output</h2>
        <pre className="bg-gray-800 text-white p-4 rounded-md text-left text-sm font-mono w-full whitespace-pre-wrap shadow-lg overflow-x-auto">
          {output}
        </pre>

        <p className="mt-2 text-lg">Retry Attempts: {retryCount}</p>

        <button
          onClick={exportLogs}
          className="bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition px-8 py-3"
          style={{ fontSize: '24px' }}
        >
          Export Logs
        </button>
      </div>
    </div>
  );
}

export default App;
