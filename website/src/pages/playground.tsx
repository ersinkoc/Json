import React, { useState } from 'react';
import { Play, Copy, Check, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const defaultJson = `{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "age": 30,
      "active": true
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "email": "bob@example.com",
      "age": 25,
      "active": false
    }
  ],
  "settings": {
    "theme": "dark",
    "notifications": true
  }
}`;

export default function PlaygroundPage() {
  const [input, setInput] = useState(defaultJson);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const handleSort = () => {
    try {
      const parsed = JSON.parse(input);
      const sorted = sortObject(parsed);
      setOutput(JSON.stringify(sorted, null, 2));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(input);
      setOutput('✅ Valid JSON');
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const sortObject = (obj: unknown): unknown => {
    if (Array.isArray(obj)) return obj.map(sortObject);
    if (obj && typeof obj === 'object') {
      const sorted: Record<string, unknown> = {};
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObject((obj as Record<string, unknown>)[key]);
      });
      return sorted;
    }
    return obj;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output || input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output || input], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target?.result as string);
        setOutput('');
        setError('');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">JSON Playground</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Format, validate, minify, and transform JSON in your browser.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-medium">Input</span>
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input type="file" accept=".json" onChange={handleUpload} className="hidden" />
                <Button variant="ghost" size="sm" asChild>
                  <span><Upload className="w-4 h-4 mr-1" /> Upload</span>
                </Button>
              </label>
              <Button variant="ghost" size="sm" onClick={() => { setInput(''); setOutput(''); setError(''); }}>
                <Trash2 className="w-4 h-4 mr-1" /> Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setInput(defaultJson)}>
                Reset
              </Button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-80 p-4 font-mono text-sm bg-zinc-950 text-zinc-100 resize-none focus:outline-none"
            placeholder="Paste your JSON here..."
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-medium">Output</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
                {copied ? <><Check className="w-4 h-4 mr-1" /> Copied</> : <><Copy className="w-4 h-4 mr-1" /> Copy</>}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!output}>
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            </div>
          </div>
          
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-2">
            <Button size="sm" onClick={handleFormat}>Format</Button>
            <Button size="sm" variant="outline" onClick={handleMinify}>Minify</Button>
            <Button size="sm" variant="outline" onClick={handleSort}>Sort Keys</Button>
            <Button size="sm" variant="outline" onClick={handleValidate}>Validate</Button>
          </div>
          
          <div className="h-64 overflow-auto">
            {error ? (
              <div className="p-4 text-red-500 font-mono text-sm">{error}</div>
            ) : output ? (
              <pre className="p-4 font-mono text-sm text-zinc-100 whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                Click a button to process your JSON
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
