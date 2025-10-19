let overlayActive = false // tracks if overlay is currently on
let overlayEl = null // holds overlay div

// create overlay div
function createOverlay() {
    if (overlayEl) return overlayEl

    overlayEl = document.createElement('div')
    overlayEl.id = 'sakura-overlay'

    // Full page, transparent except gradient on margins
    overlayEl.style.position = 'fixed'
    overlayEl.style.top = '0'
    overlayEl.style.left = '0'
    overlayEl.style.width = '100vw'
    overlayEl.style.height = '100vh'
    overlayEl.style.pointerEvents = 'none' // clicks will pass through
    overlayEl.style.zIndex = '2147483647'

    // Gradient and subtle animation
    overlayEl.style.background = 'linear-gradient(135 deg, #fceabb, #f8b500, #ff7e5f)'
    overlayEl.style.opacity = '0.25'
    overlayEl.style.transition = 'opacity 0.5 ease, background 2s ease'

    document.body.appendChild(overlayEl)
    return overlayEl
}

// Function to toggle overlay
function toggleOverlay() {
    overlayActive = !overlayActive
    if (overlayActive) {
        createOverlay()
    } else {
        if (overlayEl) {
            overlayEl.remove()
            overlayEl = null
        }
    }
}

// Keyboard command listener
chrome.runtime.onMessage.addListener((msg) => {
    if(msg.type === 'TOGGLE OVERLAY'){
        toggleOverlay()
    }
})