// Popup script for MeetMute extension

document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
});

async function initializePopup() {
  try {
    // Display current keyboard shortcut
    await displayKeyboardShortcut();
    
    // Check and display status
    await checkMeetStatus();
    
    // Set up event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
}

async function displayKeyboardShortcut() {
  try {
    const commands = await chrome.commands.getAll();
    const toggleCommand = commands.find(cmd => cmd.name === 'toggle-mute');
    
    const shortcutDisplay = document.getElementById('shortcut-display');
    
    if (toggleCommand && toggleCommand.shortcut) {
      shortcutDisplay.textContent = toggleCommand.shortcut;
    } else {
      shortcutDisplay.textContent = 'Not configured';
      shortcutDisplay.style.background = '#fce8e6';
      shortcutDisplay.style.color = '#d93025';
    }
  } catch (error) {
    console.error('Error getting keyboard shortcuts:', error);
    document.getElementById('shortcut-display').textContent = 'Error loading';
  }
}

async function checkMeetStatus() {
  try {
    const tabs = await chrome.tabs.query({});
    const meetTabs = tabs.filter(tab => 
      tab.url && tab.url.includes('meet.google.com/') && !tab.url.includes('/landing')
    );
    
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const testButton = document.getElementById('test-button');
    
    if (meetTabs.length > 0) {
      statusIndicator.classList.remove('inactive');
      statusText.textContent = `Found ${meetTabs.length} Google Meet tab${meetTabs.length > 1 ? 's' : ''}`;
      testButton.disabled = false;
    } else {
      statusIndicator.classList.add('inactive');
      statusText.textContent = 'No active Google Meet tabs found';
      testButton.disabled = true;
    }
  } catch (error) {
    console.error('Error checking Meet status:', error);
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    statusIndicator.classList.add('inactive');
    statusText.textContent = 'Error checking status';
  }
}

function setupEventListeners() {
  // Test button
  document.getElementById('test-button').addEventListener('click', async () => {
    const button = document.getElementById('test-button');
    const originalText = button.textContent;
    
    button.textContent = 'Testing...';
    button.disabled = true;
    
    try {
      // Send test message to background script
      await chrome.runtime.sendMessage({ action: 'testToggleMute' });
      
      button.textContent = 'Test Complete!';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Error testing shortcut:', error);
      button.textContent = 'Test Failed';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  });
  
  // Sync button
  document.getElementById('sync-button').addEventListener('click', async () => {
    const button = document.getElementById('sync-button');
    const originalText = button.textContent;
    
    button.textContent = 'Syncing...';
    button.disabled = true;
    
    try {
      const response = await chrome.runtime.sendMessage({ action: 'syncIconState' });
      
      if (response && response.success) {
        button.textContent = `Synced! (${response.currentState ? 'Muted' : 'Unmuted'})`;
        
        // Also refresh the status display
        await checkMeetStatus();
        
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      } else {
        button.textContent = 'Sync Failed';
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      }
    } catch (error) {
      console.error('Error syncing icon state:', error);
      button.textContent = 'Sync Failed';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  });
  
  // Shortcuts link
  document.getElementById('shortcuts-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ 
      url: 'chrome://extensions/shortcuts' 
    });
    window.close();
  });
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'statusUpdate') {
    // Update status if popup is open
    checkMeetStatus();
  }
});
