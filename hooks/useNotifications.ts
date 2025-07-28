import { useState, useEffect } from 'react'

export function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration)
          setSwRegistration(registration)
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error)
        })
    }

    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return
    }

    // Update initial permission state
    setPermissionState(Notification.permission)
    setPermissionGranted(Notification.permission === 'granted')
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setPermissionState(permission)
      const granted = permission === 'granted'
      setPermissionGranted(granted)
      
      if (!granted) {
        console.log('Permission state:', permission)
      }
      
      return granted
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  const sendNotification = async (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return
    }

    if (permissionState === 'denied') {
      console.log('Notifications were denied by the user. Please enable them in your browser settings.')
      return
    }

    if (permissionState === 'default') {
      const granted = await requestPermission()
      if (!granted) return
    }

    try {
      if (swRegistration) {
        // Use service worker to show notification with actions
        await swRegistration.showNotification(title, {
          ...options,
          requireInteraction: true,
          silent: false,
          badge: '/icon.png',
          icon: '/icon.png',
        })
      } else {
        // Fallback to basic notification without actions
        new Notification(title, {
          ...options,
          requireInteraction: true,
          badge: '/icon.png',
          icon: '/icon.png',
        })
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  return {
    permissionGranted,
    permissionState,
    requestPermission,
    sendNotification,
    swRegistration
  }
} 