# Quick Installation Guide

## Install MeetMute Chrome Extension

### Step 1: Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle switch in top right)
3. Click "Load unpacked" button
4. Select the `MeetMute` folder (this directory)
5. The extension should now appear with a clean green microphone icon in your toolbar (transparent background)

### Step 2: Configure Keyboard Shortcut (Optional)
1. Go to `chrome://extensions/shortcuts`
2. Find "MeetMute" in the list
3. Click the pencil icon next to "Toggle microphone mute in Google Meet"
4. Set your preferred shortcut (default is `Ctrl+Shift+M` / `Cmd+Shift+M`)

### Step 3: Test the Extension
1. Join a Google Meet call at https://meet.google.com
2. Click the MeetMute extension icon in Chrome's toolbar
3. Verify the status shows "Found 1 Google Meet tab"
4. Click "Test Shortcut" button or use your keyboard shortcut
5. Your microphone should toggle mute/unmute

## Troubleshooting

**Extension not loading?**
- Make sure all files are present in the MeetMute directory
- Check Chrome's developer console for errors at `chrome://extensions/`

**Shortcut not working?**
- Ensure Chrome is the active application
- Check if you're in an active Google Meet call
- Verify shortcut is configured at `chrome://extensions/shortcuts`

**Can't find mute button?**
- Refresh the Google Meet tab
- Make sure you've joined the meeting (not just on the join page)
- Try clicking "Test Shortcut" from the extension popup

## Usage
- **Default Shortcut**: `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)
- **Works**: When Chrome is active and you're in a Google Meet call
- **Visual Feedback**: 
  - 🟢 Green icon = microphone active (unmuted)
  - 🔴 Red icon with slash = microphone muted
- **Popup**: Click extension icon to view status and test functionality
- **Auto-Sync**: Icon automatically updates when you manually toggle mute in Google Meet

Enjoy using MeetMute! 🎤
