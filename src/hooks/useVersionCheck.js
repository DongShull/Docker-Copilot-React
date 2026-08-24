import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { versionAPI } from '../api/client.js'
import { shouldUpdate } from '../utils/version.js'

/**
 * 版本检查 Hook
 * 用于检查后端版本，并提示用户是否有更新
 */
export function useVersionCheck() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  // 查询后端版本信息
  const { data: versionData, refetch } = useQuery({
    queryKey: ['version'],
    queryFn: async () => {
      try {
        // 获取本地版本信息
        const localResponse = await versionAPI.getVersion('local')
        
        let backendVersion = 'unknown'
        let buildDate = ''
        let updateMode = 'container'
        
        if (localResponse.data.code === 200 || localResponse.data.code === 0) {
          const localData = localResponse.data.data
          if (localData && typeof localData === 'object') {
            backendVersion = localData.version || 'unknown'
            buildDate = localData.buildDate || ''
            updateMode = localData.updateMode || 'container'
          } else if (typeof localData === 'string') {
            backendVersion = localData
          }
        }
        
        // 获取远端版本信息
        let remoteVersion = 'unknown'
        
        try {
          const remoteResponse = await versionAPI.getVersion('remote')
          
          if (remoteResponse.data.code === 200 || remoteResponse.data.code === 0) {
            const remoteData = remoteResponse.data.data
            if (remoteData && typeof remoteData === 'object') {
              remoteVersion = remoteData.remoteVersion || remoteVersion
            } else if (typeof remoteData === 'string') {
              remoteVersion = remoteData
            }
          }
        } catch (error) {
          console.warn('获取远端版本信息失败:', error)
        }
        
        return {
          backendVersion,
          remoteVersion,
          buildDate,
          updateMode,
          hasBackendUpdate: shouldUpdate(backendVersion, remoteVersion)
        }
      } catch (error) {
        console.error('获取版本信息失败:', error)
        return {
          backendVersion: 'unknown',
          remoteVersion: 'unknown',
          buildDate: '',
          updateMode: 'container',
          hasBackendUpdate: false
        }
      }
    },
    refetchInterval: 60000, // 每分钟自动刷新
    refetchOnWindowFocus: false,
    staleTime: 30000 // 30秒内不重新请求
  })

  // 更新后端
  const updateBackend = useCallback(async () => {
    try {
      await versionAPI.updateProgram()
      setShowUpdatePrompt(true)
      // 3秒后自动刷新
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      console.error('后端更新失败:', error)
      alert('后端更新失败，请手动重启应用')
    }
  }, [])

  // 手动检查更新
  const checkForUpdates = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    // 状态
    showUpdatePrompt,
    
    // 版本数据
    backendVersion: versionData?.backendVersion,
    remoteVersion: versionData?.remoteVersion,
    buildDate: versionData?.buildDate,
    updateMode: versionData?.updateMode || 'container',
    hasBackendUpdate: versionData?.hasBackendUpdate,
    
    // 方法
    setShowUpdatePrompt,
    updateBackend,
    checkForUpdates
  }
}
