import { useEffect } from 'react'

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

export function scheduleNotification(task) {
  if (!task.dueDate || Notification.permission !== 'granted') return
  const msUntilDue = new Date(task.dueDate) - Date.now() - 30 * 60 * 1000 // 30 min before
  if (msUntilDue < 0) return
  setTimeout(() => {
    new Notification('⏰ Task Due Soon!', {
      body: `"${task.title}" is due in 30 minutes`,
      icon: '/favicon.ico',
    })
  }, msUntilDue)
}

export default function useNotifications(tasks) {
  useEffect(() => {
    requestNotificationPermission()
    if (!tasks) return
    tasks.forEach(scheduleNotification)
  }, [tasks])
}
