import React, { useEffect, useMemo, useState } from 'react'
import { resolveImageLogo } from '../config/imageLogos.js'
import { generatedIconDescriptor } from '../utils/iconResolver.js'
import { cn } from '../utils/cn.js'

const sourceLabels = {
  user: '用户图标',
  builtin: '内置图标',
  catalog: '公共图标库',
  generated: '自动生成',
}

export function ImageIcon({
  imageName = '',
  customLogos = {},
  hints = [],
  overrideURL = '',
  alt,
  className,
  imageClassName,
  title,
}) {
  const descriptor = useMemo(() => {
    if (overrideURL) {
      return {
        url: overrideURL,
        source: 'user',
        confidence: 1,
      }
    }
    return resolveImageLogo(imageName, customLogos, hints)
  }, [customLogos, hints, imageName, overrideURL])
  const fallback = useMemo(() => generatedIconDescriptor(imageName), [imageName])
  const [failedURL, setFailedURL] = useState('')

  useEffect(() => {
    setFailedURL('')
  }, [descriptor.url])

  const effectiveDescriptor = descriptor.url && failedURL !== descriptor.url
    ? descriptor
    : fallback
  const accessibleName = alt || imageName || '容器镜像'
  const sourceLabel = sourceLabels[effectiveDescriptor.source] || effectiveDescriptor.source
  const confidence = Number.isFinite(effectiveDescriptor.confidence)
    ? `，匹配度 ${Math.round(effectiveDescriptor.confidence * 100)}%`
    : ''
  const effectiveTitle = title || `${accessibleName}（${sourceLabel}${confidence}）`

  if (effectiveDescriptor.url) {
    return (
      <img
        src={effectiveDescriptor.url}
        alt={accessibleName}
        title={effectiveTitle}
        className={cn('object-contain', className, imageClassName)}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailedURL(effectiveDescriptor.url)}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={accessibleName}
      title={effectiveTitle}
      className={cn(
        'flex items-center justify-center font-semibold text-white select-none',
        className,
      )}
      style={{ backgroundColor: fallback.color }}
    >
      <span aria-hidden="true">{fallback.label}</span>
    </div>
  )
}
