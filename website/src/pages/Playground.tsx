import { useState, useCallback } from 'react'
import { CodeBlock } from '@oxog/codeshine/react'
import { Play, RotateCcw, Braces, AlignLeft, CheckCircle2, AlertCircle } from 'lucide-react'

const THEME = 'tokyo-night'

const sampleInputs: Record<string, string> = {
  basic: `{
  "name": "Alice",
  "age": 30,
  "hobbies": ["reading", "coding"],
  "address": {
    "city": "Istanbul",
    "country": "Turkey"
  }
}`,
  nested: `{"users":[{"id":1,"name":"Alice","settings":{"theme":"dark","lang":"en"}},{"id":2,"name":"Bob","settings":{"theme":"light","lang":"tr"}}]}`,
  broken: `{name: "Alice", age: 30, 'hobbies': ["reading", coding], address: {city: "Istanbul",}}`,
}

type Action = 'parse' | 'format' | 'minify' | 'validate' | 'paths'

export default function Playground() {
  const [input, setInput] = useState(sampleInputs.basic)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [activeAction, setActiveAction] = useState<Action | null>(null)

  const run = useCallback((action: Action) => {
    setError('')
    setActiveAction(action)
    try {
      switch (action) {
        case 'parse': {
          const parsed = JSON.parse(input)
          setOutput(JSON.stringify(parsed, null, 2))
          break
        }
        case 'format': {
          const parsed = JSON.parse(input)
          setOutput(JSON.stringify(parsed, null, 2))
          break
        }
        case 'minify': {
          const parsed = JSON.parse(input)
          setOutput(JSON.stringify(parsed))
          break
        }
        case 'validate': {
          JSON.parse(input)
          setOutput('{ "valid": true, "message": "Valid JSON" }')
          break
        }
        case 'paths': {
          const parsed = JSON.parse(input)
          const paths: string[] = []
          const walk = (obj: unknown, prefix: string) => {
            if (obj && typeof obj === 'object') {
              for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
                const p = prefix ? `${prefix}.${key}` : key
                paths.push(p)
                walk(val, p)
              }
            }
          }
          walk(parsed, '')
          setOutput(JSON.stringify(paths, null, 2))
          break
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setOutput('')
    }
  }, [input])

  return (
    <div className="container-custom py-16 sm:py-20">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Playground</h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          Experiment with JSON operations interactively. Paste your JSON and try the actions below.
        </p>
      </div>

      {/* Sample buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-xs text-zinc-500 self-center mr-1">Samples:</span>
        {Object.keys(sampleInputs).map((key) => (
          <button
            key={key}
            onClick={() => { setInput(sampleInputs[key]); setOutput(''); setError('') }}
            className="px-4 py-2 text-xs rounded-lg bg-white/[0.04] border border-white/8 text-zinc-400 hover:text-white hover:border-white/15 transition-all capitalize"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {([
          { action: 'format' as Action, icon: AlignLeft, label: 'Format' },
          { action: 'minify' as Action, icon: Braces, label: 'Minify' },
          { action: 'validate' as Action, icon: CheckCircle2, label: 'Validate' },
          { action: 'paths' as Action, icon: Play, label: 'Get Paths' },
        ]).map((btn) => (
          <button
            key={btn.action}
            onClick={() => run(btn.action)}
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeAction === btn.action
                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300 border'
                : 'bg-white/[0.04] border border-white/8 text-zinc-400 hover:text-white hover:border-white/15'
            }`}
          >
            <btn.icon size={14} /> {btn.label}
          </button>
        ))}
        <button
          onClick={() => { setInput(''); setOutput(''); setError(''); setActiveAction(null) }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium bg-white/[0.04] border border-white/8 text-zinc-400 hover:text-white hover:border-white/15 transition-all ml-auto"
        >
          <RotateCcw size={14} /> Clear
        </button>
      </div>

      {/* Editor panels */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Input</span>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/8 overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              className="w-full h-[420px] bg-transparent text-zinc-200 font-mono text-sm p-6 resize-none outline-none placeholder-zinc-600"
              placeholder="Paste your JSON here..."
            />
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Output</span>
            {error && (
              <span className="flex items-center gap-1 text-xs text-rose-400">
                <AlertCircle size={12} /> Error
              </span>
            )}
          </div>
          {error ? (
            <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-6 h-[420px]">
              <p className="text-rose-400 text-sm font-mono">{error}</p>
            </div>
          ) : output ? (
            <CodeBlock
              code={output}
              language="json"
              theme={THEME}
              lineNumbers
              copyButton
              maxHeight="420px"
            />
          ) : (
            <div className="rounded-xl bg-white/[0.04] border border-white/8 p-6 h-[420px] flex items-center justify-center">
              <p className="text-zinc-600 text-sm">Click an action to see the output</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
