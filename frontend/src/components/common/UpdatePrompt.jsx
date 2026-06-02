import React, { useEffect, useState } from 'react'

export default function UpdatePrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handle() {
      setVisible(true)
    }
    // If SW already flagged
    if (window.__swNeedsRefresh) setVisible(true)
    window.addEventListener('sw:need-refresh', handle)
    return () => window.removeEventListener('sw:need-refresh', handle)
  }, [])

  const doUpdate = async () => {
    try {
      if (window.__updateSW) {
        await window.__updateSW(true)
      }
    } catch (e) {
      // fallthrough
    }
    // reload to activate the new service worker
    window.location.reload()
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-md z-50">
      <div className="flex items-center gap-4">
        <div>New version available.</div>
        <button onClick={doUpdate} className="bg-white text-blue-600 px-3 py-1 rounded font-semibold">Update</button>
        <button onClick={() => setVisible(false)} className="text-white/80 px-2">Dismiss</button>
      </div>
    </div>
  )
}
