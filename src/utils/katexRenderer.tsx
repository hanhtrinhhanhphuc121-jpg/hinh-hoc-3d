import React, { useMemo } from 'react';
import katex from 'katex';

interface KaTeXProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const KaTeX: React.FC<KaTeXProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    const safeMath = math || '';
    if (!safeMath.trim()) return '';
    try {
      return katex.renderToString(safeMath, {
        displayMode: block,
        throwOnError: false,
        trust: true,
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return safeMath;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
