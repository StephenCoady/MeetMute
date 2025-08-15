// Background script for MeetMute extension

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-mute') {
    await toggleMuteInActiveMeet();
  }
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'testToggleMute') {
    await toggleMuteInActiveMeet();
    sendResponse({ success: true });
  } else if (message.action === 'syncIconState') {
    // Manual state sync request from popup
    await checkAndUpdateIconState();
    sendResponse({ success: true, currentState: currentMuteState });
  } else if (message.action === 'muteStateChanged') {
    // Content script detected a manual state change in Meet
    const newState = message.isMuted;
    
    if (newState !== currentMuteState) {
      console.log(`Background: Received manual state change notification: ${currentMuteState ? 'muted' : 'unmuted'} → ${newState ? 'muted' : 'unmuted'}`);
      await updateToolbarIconWithRetry(newState, 2);
    }
    
    sendResponse({ success: true });
  }
});

// Global state to track current mute status
// null = no Meet tab, false = unmuted, true = muted
let currentMuteState = null;

// Periodic state sync timer
let stateSyncInterval = null;

// Update toolbar icon with simplified retry
async function updateToolbarIconWithRetry(isMuted, maxRetries = 2) {
  const success = await updateToolbarIcon(isMuted);
  if (!success && maxRetries > 1) {
    // One retry after a short delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return await updateToolbarIcon(isMuted);
  }
  return success;
}

// Update toolbar icon based on state
async function updateToolbarIcon(state) {
  try {
    // state can be: true (muted), false (unmuted), null (no Meet tab)
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          let iconSet, title;
          
          if (state === null) {
            // No Meet tab - grey icons
            iconSet = {
              16: 'icons/icon16_inactive.png',
              32: 'icons/icon32_inactive.png',
              48: 'icons/icon48_inactive.png', 
              128: 'icons/icon128_inactive.png'
            };
            title = 'MeetMute - No Meet Tab Open';
          } else if (state === true) {
            // Muted - red icons
            iconSet = {
              16: 'icons/icon16_muted.png',
              32: 'icons/icon32_muted.png',
              48: 'icons/icon48_muted.png', 
              128: 'icons/icon128_muted.png'
            };
            title = 'MeetMute - Microphone Muted';
          } else {
            // Unmuted - green icons
            iconSet = {
              16: 'icons/icon16.png',
              32: 'icons/icon32.png',
              48: 'icons/icon48.png',
              128: 'icons/icon128.png'
            };
            title = 'MeetMute - Microphone Active';
          }
          
          await chrome.action.setIcon({ path: iconSet });
          await chrome.action.setTitle({ title: title });
          
          currentMuteState = state;
          resolve(true);
          
        } catch (error) {
          // Icon update failed
          resolve(false);
        }
      }, 0); // Run in next tick
    });
    
  } catch (error) {
    return false;
  }
}



// Function to find and toggle mute in active Google Meet tab
async function toggleMuteInActiveMeet() {
  try {
    // Get all tabs
    const tabs = await chrome.tabs.query({});
    
    // Find Google Meet tabs
    const meetTabs = tabs.filter(tab => 
      tab.url && tab.url.includes('meet.google.com/') && !tab.url.includes('/landing')
    );
    
          if (meetTabs.length === 0) {
        // Quietly show notification that no Meet tabs were found
        await showNotification('No Google Meet tabs found');
        await updateToolbarIconWithRetry(null, 1); // null = no Meet tab
        return;
      }
    
    // If multiple Meet tabs, prioritize the active one or the first one
    const targetTab = meetTabs.find(tab => tab.active) || meetTabs[0];
    
    // Send message to content script to toggle mute
    try {
      const response = await chrome.tabs.sendMessage(targetTab.id, { 
        action: 'toggleMute' 
      });
      
      if (response && response.success) {
        // IMMEDIATELY flip the icon state (assume toggle worked)
        const assumedNewState = currentMuteState === null ? true : !currentMuteState;
        await updateToolbarIconWithRetry(assumedNewState, 1);
        
        // Show notification based on assumed state
        await showNotification(assumedNewState ? 'Microphone Muted' : 'Microphone Unmuted');
        
      } else {
        // Toggle failed - just show a notification
        await showNotification('Toggle failed - check Meet tab');
      }
    } catch (error) {
      // Content script communication failed - try to inject and retry once
      try {
        await chrome.scripting.executeScript({
          target: { tabId: targetTab.id },
          files: ['content.js']
        });
        
        // One retry after injection
        const response = await chrome.tabs.sendMessage(targetTab.id, { 
          action: 'toggleMute' 
        });
        
        if (response && response.success) {
          // IMMEDIATELY flip the icon state (assume toggle worked)
          const assumedNewState = currentMuteState === null ? true : !currentMuteState;
          await updateToolbarIconWithRetry(assumedNewState, 1);
          await showNotification(assumedNewState ? 'Microphone Muted' : 'Microphone Unmuted');
        } else {
          await showNotification('Toggle failed - check Meet tab');
        }
      } catch (retryError) {
        // Final fallback - just show notification
        await showNotification('MeetMute: Check Meet tab and try again');
      }
    }
    
  } catch (error) {
    // Ignore top-level errors
  }
}

// Show notification to user
async function showNotification(message) {
  try {
    if ('notifications' in chrome && chrome.notifications) {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'MeetMute',
        message: message
      });
    }
  } catch (error) {
    // Ignore notification errors
  }
}

// Handle extension installation and startup
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      shortcutEnabled: true,
      showNotifications: true
    });
  }
  
  // Check if Meet tabs exist and update icon accordingly
  await checkAndUpdateIconState();
});

chrome.runtime.onStartup.addListener(async () => {
  // Check if Meet tabs exist and update icon accordingly
  await checkAndUpdateIconState();
});

// Monitor tab changes to update icon state
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.includes('meet.google.com/') && !tab.url.includes('/landing')) {
      // Switched to Meet tab - sync icon state and start periodic checking
      setTimeout(() => forceIconSync(activeInfo.tabId), 200);
      startPeriodicStateSync();
    } else {
      // Not a Meet tab - stop periodic checking
      stopPeriodicStateSync();
    }
  } catch (error) {
    // Ignore tab query errors
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes('meet.google.com/') && changeInfo.status === 'complete') {
    // Meet tab finished loading - sync icon state and start periodic checking
    setTimeout(() => forceIconSync(tabId), 500);
    if (tab.active) {
      startPeriodicStateSync();
    }
  }
});

// Monitor tab closures to switch to grey icon if no Meet tabs remain
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  // Check if any Meet tabs remain after this tab was closed
  setTimeout(async () => {
    await checkAndUpdateIconState();
  }, 100);
});

// Force icon sync with a specific tab
async function forceIconSync(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { 
      action: 'getCurrentMuteState' 
    });
    
    if (response && response.success && response.isMuted !== currentMuteState) {
      await updateToolbarIconWithRetry(response.isMuted, 1);
    }
  } catch (error) {
    // Ignore - content script might not be ready
  }
}

// Function to check current mute state and update icon accordingly
async function checkAndUpdateIconState() {
  try {
    const tabs = await chrome.tabs.query({});
    const meetTabs = tabs.filter(tab => 
      tab.url && tab.url.includes('meet.google.com/') && !tab.url.includes('/landing')
    );
    
    if (meetTabs.length === 0) {
      if (currentMuteState !== null) {
        await updateToolbarIconWithRetry(null, 1); // null = no Meet tab
      }
      return;
    }
    
    const activeTab = meetTabs.find(tab => tab.active) || meetTabs[0];
    
    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, { 
        action: 'getCurrentMuteState' 
      });
      
      if (response && response.success && response.isMuted !== currentMuteState) {
        await updateToolbarIconWithRetry(response.isMuted, 1);
      }
    } catch (error) {
      // Ignore - content script might not be ready
    }
    
  } catch (error) {
    // Ignore errors
  }
}

// Start periodic state synchronization when on Meet tabs
function startPeriodicStateSync() {
  // Clear any existing timer
  if (stateSyncInterval) {
    clearInterval(stateSyncInterval);
  }
  
  // Start new timer - check every 5 seconds
  stateSyncInterval = setInterval(async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (activeTab && activeTab.url && activeTab.url.includes('meet.google.com/') && !activeTab.url.includes('/landing')) {
        // We're on a Meet tab - check actual state
        try {
          const response = await chrome.tabs.sendMessage(activeTab.id, { 
            action: 'getCurrentMuteState' 
          });
          
          if (response && response.success && response.isMuted !== currentMuteState) {
            // State drift detected - resync icon
            await updateToolbarIconWithRetry(response.isMuted, 1);
          }
        } catch (error) {
          // Content script not ready, ignore
        }
      } else {
        // Not on Meet tab anymore - stop periodic checking
        stopPeriodicStateSync();
      }
    } catch (error) {
      // Ignore query errors
    }
  }, 5000); // Every 5 seconds
}

// Stop periodic state synchronization
function stopPeriodicStateSync() {
  if (stateSyncInterval) {
    clearInterval(stateSyncInterval);
    stateSyncInterval = null;
  }
}
