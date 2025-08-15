// Content script for Google Meet pages

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleMute') {
    // Handle async operation
    toggleMicrophone().then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  } else if (message.action === 'getCurrentMuteState') {
    const result = getCurrentMuteState();
    sendResponse(result);
  }
  return false; // Synchronous response for getCurrentMuteState
});

// Function to find and toggle the microphone button
async function toggleMicrophone() {
  try {
    // Very specific selectors to target ONLY personal microphone button, not host controls
    const selectors = [
      // Primary selector - personal mic button with specific test ID
      'button[data-testid="mic-button"]',
      
      // Personal microphone button in bottom toolbar
      'div[data-allocation-index="0"] button[aria-label*="microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])',
      'div[data-allocation-index="1"] button[aria-label*="microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])',
      'div[data-allocation-index="2"] button[aria-label*="microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])',
      
      // Personal mic button with specific positioning (bottom controls)
      '[role="toolbar"] button[aria-label*="microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])',
      
      // More specific selectors that exclude host controls
      'button[aria-label*="Turn on microphone" i]',
      'button[aria-label*="Turn off microphone" i]', 
      'button[aria-label*="Mute microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i])',
      'button[aria-label*="Unmute microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i])',
      
      // Fallback with very strict filtering
      'button[aria-pressed][aria-label*="mic" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])'
    ];
    
    let micButton = null;
    
    // Try each selector until we find the microphone button
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        // Check if this element looks like a microphone button
        if (isMicrophoneButton(element)) {
          micButton = element;
          break;
        }
      }
      
      if (micButton) break;
    }
    
    // If we couldn't find it with selectors, try a more aggressive search
    if (!micButton) {
      micButton = findMicButtonByContent();
    }
    
    if (!micButton) {
      return {
        success: false,
        error: 'Could not find microphone button. Make sure you are in a Google Meet call.'
      };
    }
    
    // Click the button to toggle mute
    micButton.click();
    
    // Don't wait for UI update - just assume it worked
    // (UI won't update when tab isn't active anyway)
    return {
      success: true
    };
    
  } catch (error) {
    // Silently handle toggle errors
    return {
      success: false,
      error: error.message
    };
  }
}

// Check if an element is likely the PERSONAL microphone button (not host controls)
function isMicrophoneButton(element) {
  if (!element) return false;
  
  const text = element.textContent?.toLowerCase() || '';
  const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
  const title = element.getAttribute('title')?.toLowerCase() || '';
  const testId = element.getAttribute('data-testid')?.toLowerCase() || '';
  const allText = `${text} ${ariaLabel} ${title} ${testId}`;
  
  // SAFETY CHECK: Exclude host/admin controls
  const hostControlTerms = [
    'everyone', 'all participants', 'all attendees', 'mute all', 'unmute all',
    'participants', 'attendees', 'others', 'moderator', 'host', 'admin',
    'people', 'users', 'members', 'guests'
  ];
  
  // If this contains any host control terms, reject it
  const hasHostTerms = hostControlTerms.some(term => allText.includes(term));
  if (hasHostTerms) {
    return false;
  }
  
  // Look for personal microphone-related terms
  const personalMicTerms = ['microphone', 'mic', 'mute', 'unmute'];
  const hasMicTerms = personalMicTerms.some(term => allText.includes(term));
  
  if (!hasMicTerms) return false;
  
  // Additional safety: Check if it's in the main control bar (not in a menu or sidebar)
  const controlBar = element.closest('[role="toolbar"]') || 
                    element.closest('[data-allocation-index]') ||
                    element.closest('.crqnQb'); // Meet control bar class
  
  if (!controlBar) {
    return false;
  }
  
  // Check for specific test ID (most reliable)
  if (testId === 'mic-button') {
    return true;
  }
  
  // Final verification: personal microphone terms without host terms
  const personalTerms = [
    'turn on microphone', 'turn off microphone',
    'mute microphone', 'unmute microphone',
    'microphone on', 'microphone off'
  ];
  
  const hasPersonalTerms = personalTerms.some(term => allText.includes(term));
  
  if (hasPersonalTerms) {
    return true;
  }
  
  return false;
}

// Determine current mute state of the button
function getMuteState(button) {
  if (!button) return null;
  
  // Check various attributes that indicate mute state
  const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
  const ariaPressed = button.getAttribute('aria-pressed');
  const title = button.getAttribute('title')?.toLowerCase() || '';
  const testId = button.getAttribute('data-testid')?.toLowerCase() || '';
  
  // Most reliable: Check aria-label content for specific terms
  if (ariaLabel.includes('unmute') || ariaLabel.includes('turn on')) {
    return true; // Currently muted (button says "unmute")
  } else if (ariaLabel.includes('mute') && !ariaLabel.includes('unmute') || ariaLabel.includes('turn off')) {
    return false; // Currently unmuted (button says "mute")
  }
  
  // Fallback: Check aria-pressed state
  if (ariaPressed === 'true') {
    return false; // Pressed usually means active/unmuted in Meet
  } else if (ariaPressed === 'false') {
    return true; // Not pressed usually means muted
  }
  
  // Visual fallback: Check for red styling (muted state)
  const computedStyle = window.getComputedStyle(button);
  const hasRedBackground = computedStyle.backgroundColor?.includes('rgb(234, 67, 53)') || 
                          computedStyle.backgroundColor?.includes('rgb(217, 48, 37)') ||
                          button.classList.contains('Tg7LZd'); // Google Meet muted class
  
  if (hasRedBackground) {
    return true;
  }
  
  // Check for red mic icon SVG
  const micIcon = button.querySelector('svg[data-testid], svg path, svg g');
  if (micIcon) {
    const fill = micIcon.getAttribute('fill') || '';
    if (fill.includes('#ea4335') || fill.includes('#d33b2c')) {
      return true;
    }
  }
  
  return false; // Default to unmuted if we can't determine
}

// Fallback function to find mic button by searching for common patterns
function findMicButtonByContent() {
  // Look for buttons ONLY in the main control bar area (not in menus or sidebars)
  const controlsArea = document.querySelector('[data-allocation-index]') || 
                      document.querySelector('.crqnQb') || // Meet controls container
                      document.querySelector('[role="toolbar"]');
  
  if (controlsArea) {
    const buttons = controlsArea.querySelectorAll('button');
    
    for (const button of buttons) {
      if (isMicrophoneButton(button)) {
        return button;
      }
    }
  }
  
  // More targeted search: only look in the bottom toolbar, not anywhere else
  const bottomToolbars = document.querySelectorAll('[role="toolbar"]');
  for (const toolbar of bottomToolbars) {
    const buttons = toolbar.querySelectorAll('button');
    
    for (const button of buttons) {
      if (isMicrophoneButton(button)) {
        return button;
      }
    }
  }
  
  return null;
}

// Add a visual indicator when the extension is active (optional)
function showMuteStatus(isMuted) {
  // Remove any existing indicator
  const existingIndicator = document.getElementById('meetmute-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  // Create new indicator
  const indicator = document.createElement('div');
  indicator.id = 'meetmute-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isMuted ? '#ea4335' : '#34a853'};
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: 'Google Sans', Roboto, Arial, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transition: opacity 0.3s;
  `;
  indicator.textContent = isMuted ? '🎤 Muted' : '🎤 Unmuted';
  
  document.body.appendChild(indicator);
  
  // Remove after 2 seconds
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }, 2000);
}

// Function to get current mute state without toggling
function getCurrentMuteState() {
  try {
    // Use the same safe selectors as toggleMicrophone
    const selectors = [
      // Primary selector - personal mic button with specific test ID
      'button[data-testid="mic-button"]',
      
      // Personal microphone button in bottom toolbar
      'div[data-allocation-index="0"] button[aria-label*="microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])',
      'div[data-allocation-index="1"] button[aria-label*="microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])',
      'div[data-allocation-index="2"] button[aria-label*="microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])',
      
      // Personal mic button with specific positioning (bottom controls)
      '[role="toolbar"] button[aria-label*="microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])',
      
      // More specific selectors that exclude host controls
      'button[aria-label*="Turn on microphone" i]',
      'button[aria-label*="Turn off microphone" i]', 
      'button[aria-label*="Mute microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i])',
      'button[aria-label*="Unmute microphone" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i])',
      
      // Fallback with very strict filtering
      'button[aria-pressed][aria-label*="mic" i]:not([aria-label*="everyone" i]):not([aria-label*="all" i]):not([aria-label*="participants" i])'
    ];
    
    let micButton = null;
    
    // Try each selector until we find the microphone button
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        if (isMicrophoneButton(element)) {
          micButton = element;
          break;
        }
      }
      
      if (micButton) break;
    }
    
    // If we couldn't find it with selectors, try the fallback search
    if (!micButton) {
      micButton = findMicButtonByContent();
    }
    
    if (!micButton) {
      return {
        success: false,
        error: 'Could not find microphone button'
      };
    }
    
    const isMuted = getMuteState(micButton);
    
    return {
      success: true,
      isMuted: isMuted
    };
    
  } catch (error) {
    // Silently handle state detection errors
    return {
      success: false,
      error: error.message
    };
  }
}

// Monitor for manual mute state changes in Google Meet
let lastKnownMuteState = null;
let stateMonitorInterval = null;

function startMuteStateMonitoring() {
  // Clear any existing interval
  if (stateMonitorInterval) {
    clearInterval(stateMonitorInterval);
  }
  
  // Check mute state every 2 seconds
  stateMonitorInterval = setInterval(() => {
    try {
      const currentState = getCurrentMuteState();
      
      if (currentState.success && currentState.isMuted !== lastKnownMuteState) {
        // Notify background script of state change
        chrome.runtime.sendMessage({
          action: 'muteStateChanged',
          isMuted: currentState.isMuted
        }).catch(error => {
          // Ignore errors if background script isn't listening
        });
        
        lastKnownMuteState = currentState.isMuted;
      }
    } catch (error) {
      // Ignore monitoring errors
    }
  }, 2000);
}

function stopMuteStateMonitoring() {
  if (stateMonitorInterval) {
    clearInterval(stateMonitorInterval);
    stateMonitorInterval = null;
  }
}

// Initialize monitoring with current state to avoid false positives
setTimeout(() => {
  try {
    const initialState = getCurrentMuteState();
    if (initialState.success) {
      lastKnownMuteState = initialState.isMuted;
    }
  } catch (error) {
    // Ignore initial state detection errors
  }
  
  // Start monitoring after getting initial state
  startMuteStateMonitoring();
}, 1000); // Wait 1 second for page to settle

// Stop monitoring when page unloads
window.addEventListener('beforeunload', stopMuteStateMonitoring);

// Initialize content script

