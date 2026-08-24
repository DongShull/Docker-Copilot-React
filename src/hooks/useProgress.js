import { useEffect, useRef, useState } from 'react'
import { progressAPI } from '../api/client.js'

const POLL_INTERVAL = 2000
const POLL_TIMEOUT = 30 * 60 * 1000

export function useProgress(taskId, onComplete, onError) {
  const [progress, setProgress] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  const callbacksRef = useRef({ onComplete, onError })

  useEffect(() => {
    callbacksRef.current = { onComplete, onError }
  }, [onComplete, onError])

  useEffect(() => {
    if (!taskId) {
      setIsPolling(false)
      setProgress(null)
      return undefined
    }

    let cancelled = false
    let timer = null
    const deadline = Date.now() + POLL_TIMEOUT
    setIsPolling(true)

    const stop = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      if (!cancelled) setIsPolling(false)
    }

    const fail = (error) => {
      stop()
      callbacksRef.current.onError?.(error)
    }

    const poll = async () => {
      try {
        if (Date.now() >= deadline) {
          fail(new Error('任务进度查询超时'))
          return
        }
        const response = await progressAPI.getProgress(taskId)
        if (cancelled) return
        const envelope = response.data
        const task = envelope?.data
        if (envelope?.code !== 200 || !task) {
          fail(new Error(envelope?.msg || '无法读取任务状态'))
          return
        }
        setProgress(task)
        if (task.status === 'failed') {
          fail(new Error(task.detailMsg || task.message || '任务失败'))
          return
        }
        if (task.isDone === true && task.status === 'completed') {
          stop()
          callbacksRef.current.onComplete?.(task)
          return
        }
        timer = setTimeout(poll, POLL_INTERVAL)
      } catch (error) {
        if (!cancelled) fail(error)
      }
    }

    poll()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [taskId])

  return { progress, isPolling }
}
