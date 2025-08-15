# 🎤 MeetMute

A Chrome extension that allows you to quickly mute/unmute your microphone in Google Meet using a customizable keyboard shortcut.

## Features

- **Quick Toggle**: Mute/unmute your microphone instantly with a keyboard shortcut
- **Global Shortcut**: Works from any Chrome tab or window (default: `Ctrl+Shift+M` / `Cmd+Shift+M`)
- **Three-State Dynamic Icon**: Professional microphone icon that shows current status:
  - 🟢 **Green microphone**: Traditional mic design (Meet tab open, unmuted)
  - 🔴 **Red microphone with slash**: Same mic with diagonal line (Meet tab open, muted)
  - ⚫ **Grey microphone**: Inactive state (no Google Meet tabs open)
- **Smart Detection**: Automatically finds and targets active Google Meet tabs
- **Safety First**: Only targets your personal microphone button, never host/moderator controls
- **Visual Feedback**: Shows mute status notifications + icon changes
- **Auto-Sync**: Icon automatically updates when you manually toggle mute in Google Meet
- **Configurable**: Easy-to-use popup interface with status information

## Installation

### Method 1: Load as Developer Extension

1. **Download or Clone** this repository to your computer
2. **Load Extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the MeetMute folder
   - The extension should load with proper icons (green/red microphone)
3. **Configure Shortcut** (optional):
   - Go to `chrome://extensions/shortcuts`
   - Find "MeetMute" and set your preferred keyboard shortcut
   - Default is `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)

### Method 2: Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store once published.

## Usage

### Basic Usage
1. Join a Google Meet call
2. Press your configured keyboard shortcut (default: `Ctrl+Shift+M` or `Cmd+Shift+M`)
3. Your microphone will toggle between muted and unmuted states
4. A brief notification will show the current status

### Extension Popup
Click the MeetMute icon in Chrome's toolbar to:
- View current keyboard shortcut
- Check extension status
- Test the mute functionality
- Access shortcut configuration

## How It Works

The extension consists of several components:

1. **Background Script**: Listens for keyboard shortcuts and manages tab communication
2. **Content Script**: Injected into Google Meet pages to interact with the mute button
3. **Popup Interface**: Provides status information and configuration options

### Keyboard Shortcut Behavior
- Works when Chrome is the active application
- Automatically finds Google Meet tabs
- If multiple Meet tabs are open, prioritizes the currently active tab
- Provides visual feedback through notifications

### Compatibility
- **Supported**: Google Meet (meet.google.com)
- **Browser**: Chrome (Manifest V3)
- **OS**: Windows, macOS, Linux

## Limitations

- **Chrome Only**: Shortcuts work only when Chrome is the active application (Chrome extension limitation)
- **Google Meet Only**: Currently supports Google Meet only
- **Tab Detection**: Requires Google Meet to be open in a Chrome tab

## Development

### File Structure
```
MeetMute/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Content script for Google Meet
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── create_icons.html     # Icon generator tool
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Building
1. Ensure all icon files are generated and placed in `/icons/`
2. Load as unpacked extension in Chrome
3. Test functionality on Google Meet

### Testing
1. Open the extension popup to check status
2. Join a Google Meet call
3. Test the keyboard shortcut
4. Verify mute state changes in Google Meet

## Troubleshooting

### Extension Not Working
- **Check Status**: Open the extension popup to see if Meet tabs are detected
- **Reload Extension**: Go to `chrome://extensions/` and reload MeetMute
- **Refresh Meet Tab**: Reload your Google Meet tab
- **Check Shortcut**: Verify keyboard shortcut is configured at `chrome://extensions/shortcuts`

### Shortcut Not Responding
- **Chrome Focus**: Ensure Chrome is the active application
- **Conflicting Shortcuts**: Check if another app is using the same shortcut
- **Meet Tab Active**: Make sure you're in an active Google Meet call
- **Extension Permissions**: Verify the extension has access to the Meet tab

### If Icons Still Don't Update (Rare)
- **Manual Sync**: Click "Sync Icon State" button in extension popup
- **Reload Extension**: Go to `chrome://extensions/` and reload MeetMute
- **Check Notifications**: Extension shows "Microphone Muted/Unmuted" status messages

## Privacy & Security

- **No Data Collection**: The extension does not collect or store any personal data
- **Local Operation**: All functionality works locally within your browser
- **Minimal Permissions**: Only requests necessary permissions for Google Meet interaction
- **Open Source**: Code is available for review and audit

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify you're using a supported version of Chrome
3. Ensure Google Meet is open and active
4. Try reloading the extension

## License

MIT License - See LICENSE file for details