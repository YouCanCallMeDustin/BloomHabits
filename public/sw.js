self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification
  const action = event.action
  const data = notification.data || {}

  notification.close()

  if (action === 'complete' || action === 'skip' || action === 'snooze') {
    // Post message to the client
    clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_ACTION',
          action: action,
          habitId: data.habitId,
          scheduledTime: data.scheduledTime
        })
      })
    })
  }
}) 