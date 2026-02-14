import React from 'react';
import { CodeBlock as CodeShineBlock } from '@oxog/codeshine/react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

export function CodeBlock({
  code,
  language = 'typescript',
  title,
  showLineNumbers = true,
  highlightLines = [],
  className,
}: CodeBlockProps) {
  // Check if dark mode class is in className
  const isDark = className?.includes('dark');

  return (
    <div className={cn('relative group rounded-lg overflow-hidden', className)}>
      <CodeShineBlock
        code={code}
        language={language}
        theme={isDark ? 'dark' : 'light'}
        title={title}
        showLineNumbers={showLineNumbers}
        highlightRanges={highlightLines}
        copyButton
      />
    </div>
  );
}
