import React, { useState } from 'react'

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * Renders an image. If src is empty or the image fails to load, shows only the alt text (no fallback image).
 */
export function ImageWithFallback({ src, alt, style, className, ...rest }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  const hasSrc = typeof src === 'string' && src.trim().length > 0

  if (!hasSrc || failed) {
    return (
      <div
        className={className ?? ''}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F5F5',
          color: '#666',
          fontSize: '0.875rem',
          textAlign: 'center',
          padding: 8,
        }}
        aria-label={alt ?? 'Image'}
      >
        {alt ?? 'Image'}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt ?? ''}
      className={className}
      style={style}
      {...rest}
      onError={() => setFailed(true)}
    />
  )
}
