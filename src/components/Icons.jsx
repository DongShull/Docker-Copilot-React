import React, { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Eye, Search, Star, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { imageAPI } from '../api/client.js'
import {
  builtInImageLogos,
  getCatalogIconURL,
  iconCatalogInfo,
} from '../config/imageLogos.js'
import { cn } from '../utils/cn.js'
import { ImageIcon } from './ImageIcon.jsx'

const catalogRenderLimit = 120

const categoryLabels = {
  all: '全部分类',
  custom: '本地图标',
  builtin: '内置图标',
  catalog: '公共图标库',
  favorites: '收藏',
}

const sourceLabels = {
  custom: '本地图标库',
  builtin: '内置图标库',
  catalog: '公共图标库',
}

function IconCard({ icon, favorite, copied, onSelect, onFavorite, onCopy }) {
  return (
    <div className="group cursor-pointer" onClick={() => onSelect(icon)}>
      <div className="card p-4 rounded-2xl hover:shadow-lg transition-all h-full flex flex-col items-center justify-center">
        <div className="relative w-full mb-3">
          <ImageIcon
            imageName={icon.name}
            overrideURL={icon.url}
            alt={icon.name}
            title={`${icon.name}（${sourceLabels[icon.source]}）`}
            className="w-12 h-12 mx-auto rounded-lg"
          />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onFavorite(icon)
            }}
            className="absolute -top-1 -right-1 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label={favorite ? `取消收藏 ${icon.name}` : `收藏 ${icon.name}`}
          >
            <Star className={cn('h-4 w-4', favorite ? 'text-yellow-500 fill-current' : 'text-gray-300 hover:text-yellow-500')} />
          </button>
        </div>

        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate text-center w-full" title={icon.name}>
          {icon.name}
        </p>

        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 w-full opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onCopy(icon)
            }}
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
            title="复制链接"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              window.open(icon.url, '_blank', 'noopener,noreferrer')
            }}
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
            title="查看原图"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function IconSection({ title, icons, favorites, copiedIcon, onSelect, onFavorite, onCopy }) {
  if (icons.length === 0) return null

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-1 flex items-center gap-2">
        <span className="w-1 h-5 bg-primary-500 rounded-full" />
        {title}
        <span className="text-sm font-normal text-gray-500 ml-2">({icons.length})</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {icons.map(icon => (
          <IconCard
            key={icon.key}
            icon={icon}
            favorite={favorites.includes(icon.key) || favorites.includes(icon.name)}
            copied={copiedIcon === icon.key}
            onSelect={onSelect}
            onFavorite={onFavorite}
            onCopy={onCopy}
          />
        ))}
      </div>
    </section>
  )
}

export function Icons() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [copiedIcon, setCopiedIcon] = useState(null)
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [favorites, setFavorites] = useState([])

  const { data: customIcons = {} } = useQuery({
    queryKey: ['customIcons'],
    queryFn: async () => {
      const response = await imageAPI.getIcons()
      if (response.data.code === 200 || response.data.code === 0) {
        return response.data.data || {}
      }
      return {}
    },
    refetchOnMount: true,
  })

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('docker_copilot_icon_favorites') || '[]')
      if (Array.isArray(saved)) setFavorites(saved.filter(value => typeof value === 'string'))
    } catch (error) {
      console.error('解析收藏数据失败:', error)
    }
  }, [])

  const query = searchTerm.trim().toLowerCase()
  const allIcons = useMemo(() => ({
    custom: Object.entries(customIcons).map(([name, url]) => ({ key: `custom:${name}`, name, url, source: 'custom' })),
    builtin: Object.entries(builtInImageLogos).map(([name, url]) => ({ key: `builtin:${name}`, name, url, source: 'builtin' })),
    catalog: iconCatalogInfo.icons.map(name => ({
      key: `catalog:${name}`,
      name,
      url: getCatalogIconURL(name),
      source: 'catalog',
    })),
  }), [customIcons])

  const matchesCommonFilters = icon => {
    if (selectedCategory === 'favorites' && !favorites.includes(icon.key) && !favorites.includes(icon.name)) return false
    return !query || icon.name.toLowerCase().includes(query)
  }

  const showSource = source => (
    selectedCategory === 'all'
    || selectedCategory === source
    || selectedCategory === 'favorites'
  )
  const customMatches = showSource('custom') ? allIcons.custom.filter(matchesCommonFilters) : []
  const builtInMatches = showSource('builtin') ? allIcons.builtin.filter(matchesCommonFilters) : []
  const shouldBrowseCatalog = selectedCategory === 'catalog' || selectedCategory === 'favorites' || Boolean(query)
  const allCatalogMatches = showSource('catalog') && shouldBrowseCatalog
    ? allIcons.catalog.filter(matchesCommonFilters)
    : []
  const catalogMatches = allCatalogMatches.slice(0, catalogRenderLimit)
  const visibleCount = customMatches.length + builtInMatches.length + allCatalogMatches.length

  const saveFavorites = newFavorites => {
    setFavorites(newFavorites)
    localStorage.setItem('docker_copilot_icon_favorites', JSON.stringify(newFavorites))
  }

  const toggleFavorite = icon => {
    const currentlyFavorite = favorites.includes(icon.key) || favorites.includes(icon.name)
    const cleaned = favorites.filter(value => value !== icon.key && value !== icon.name)
    saveFavorites(currentlyFavorite ? cleaned : [...cleaned, icon.key])
  }

  const copyToClipboard = async icon => {
    try {
      await navigator.clipboard.writeText(icon.url)
      setCopiedIcon(icon.key)
      setTimeout(() => setCopiedIcon(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const sections = [
    { source: 'custom', title: sourceLabels.custom, icons: customMatches },
    { source: 'builtin', title: sourceLabels.builtin, icons: builtInMatches },
    { source: 'catalog', title: sourceLabels.catalog, icons: catalogMatches },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-4 sm:px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">图标库</h2>
        <p className="text-gray-600 dark:text-gray-400">
          精确匹配本地图标和 {iconCatalogInfo.icons.length} 个公共图标；未匹配的镜像会生成稳定的专属图标
        </p>
      </div>

      <div className="px-4 sm:px-6 py-4 space-y-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="搜索图标名称..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <select
            value={selectedCategory}
            onChange={event => setSelectedCategory(event.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">匹配 {visibleCount} 个</span>
          {allCatalogMatches.length > catalogRenderLimit && (
            <span className="text-sm text-amber-600 dark:text-amber-400">
              公共图标仅展示前 {catalogRenderLimit} 个，请继续缩小搜索范围
            </span>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 space-y-8">
        {selectedCategory === 'all' && !query && (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
            输入搜索词或选择“公共图标库”后加载第三方图标，避免一次请求数千个资源。
          </div>
        )}

        {sections.map(section => (
          <IconSection
            key={section.source}
            title={section.title}
            icons={section.icons}
            favorites={favorites}
            copiedIcon={copiedIcon}
            onSelect={setSelectedIcon}
            onFavorite={toggleFavorite}
            onCopy={copyToClipboard}
          />
        ))}

        {visibleCount === 0 && !(selectedCategory === 'all' && !query) && (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">没有找到图标</h3>
            <p className="text-gray-500 dark:text-gray-400">尝试调整搜索词或分类</p>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          公共图标来自 Homarr Labs Dashboard Icons，固定版本 {iconCatalogInfo.revision.slice(0, 12)}，许可证 {iconCatalogInfo.license}。
        </p>
      </div>

      {selectedIcon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedIcon(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={event => event.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">图标详情</h3>
                <button type="button" onClick={() => setSelectedIcon(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg" aria-label="关闭">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <ImageIcon
                  imageName={selectedIcon.name}
                  overrideURL={selectedIcon.url}
                  alt={selectedIcon.name}
                  className="w-32 h-32 mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium">
                  {selectedIcon.name}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={selectedIcon.url} readOnly className="flex-1 min-w-0 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm border border-gray-200 dark:border-gray-600" />
                  <button type="button" onClick={() => copyToClipboard(selectedIcon)} className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 flex-shrink-0">
                    {copiedIcon === selectedIcon.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedIcon === selectedIcon.key ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => window.open(selectedIcon.url, '_blank', 'noopener,noreferrer')} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    在新窗口打开
                  </button>
                  <button type="button" onClick={() => toggleFavorite(selectedIcon)} className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors">
                    {favorites.includes(selectedIcon.key) || favorites.includes(selectedIcon.name) ? '取消收藏' : '添加收藏'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
