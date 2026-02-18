import { lazy, Suspense, type ComponentProps } from 'react'

// Lazy load the CodeBlock component - it's 374KB and only needed on specific pages
const CodeBlock = lazy(() => import('@oxog/codeshine/react').then(module => ({ default: module.CodeBlock })))

// Loading skeleton that matches CodeBlock dimensions
function CodeBlockSkeleton({ height = 'auto' }: { height?: string }) {
  return (
    <div
      className="rounded-xl bg-white/[0.04] border border-white/8 animate-pulse"
      style={{ height }}
    >
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-600">
          <div className="w-4 h-4 rounded-full bg-zinc-700 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-4 h-4 rounded-full bg-zinc-700 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-4 h-4 rounded-full bg-zinc-700 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

type CodeBlockProps = ComponentProps<typeof CodeBlock>

interface LazyCodeBlockProps extends Omit<CodeBlockProps, 'className'> {
  height?: string
  showSkeleton?: boolean
}

/**
 * Lazy-loaded CodeBlock component with Suspense
 * Use this for pages that don't need code highlighting immediately on load
 */
export function LazyCodeBlock({ height, showSkeleton = true, ...props }: LazyCodeBlockProps) {
  return (
    <Suspense
      fallback={
        showSkeleton ? (
          <CodeBlockSkeleton height={height} />
        ) : (
          <div className="rounded-xl bg-white/[0.04] border border-white/8" style={{ height }} />
        )
      }
    >
      <CodeBlock {...props} />
    </Suspense>
  )
}

export { CodeBlock }
