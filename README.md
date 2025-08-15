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

### Multiple Meet Tabs
- The extension will prioritize the currently active Meet tab
- If no tab is active, it will use the first available Meet tab

### Extension Muting Everyone (Critical Issue Fixed)
- **⚠️ Issue**: Previous versions could accidentally click "mute all" host controls
- **✅ Fixed**: Extension now has strict safety checks to prevent this
- **Safety Features**: Only targets personal microphone button in main toolbar
- **Never Targets**: Host controls, participant lists, or admin buttons
- **Console Logs**: Check browser console (F12) for "MeetMute:" safety messages
- **Update Required**: Reload extension in `chrome://extensions/` to get the fix

### ~~Toolbar Icon Not Changing~~ ✅ FIXED in v1.2.0!
- **Previous Issue**: Icon only changed when you were on the Meet tab
- **Solution**: v1.2.0+ uses smart toggle logic that immediately updates the icon
- **How It Works**: 
  - Extension assumes toggle worked and flips icon instantly
  - Periodic state sync (every 5 seconds) corrects any drift when on Meet tabs
  - No more waiting for UI updates that don't happen on inactive tabs
- **Result**: Icon updates are now instant and reliable from any tab! 🎉

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

## Changelog

### v1.2.0
- **INSTANT ICON UPDATES**: Fixed icon not updating when using shortcut from non-Meet tabs
- **Smart Toggle Logic**: Immediately assumes toggle worked and flips icon (no waiting for UI)
- **Periodic State Sync**: Automatically resyncs icon state every 5 seconds when on Meet tabs
- **Improved Reliability**: Icon updates are now instant and consistent regardless of active tab
- **Better UX**: No more delay or missed icon updates when toggling from anywhere

### v1.1.0
- **THREE-STATE ICONS**: Added grey icon state when no Meet tabs are open
- **Visual Status Indicators**:
  - 🟢 Green microphone = Meet tab open, unmuted
  - 🔴 Red microphone (with slash) = Meet tab open, muted  
  - ⚫ Grey microphone = No Meet tabs open
- **Smart Detection**: Automatically detects when Meet tabs are opened/closed
- **Improved User Experience**: Clear visual indication of when extension can work

### v1.0.6
- **CLEAN ICON VERSION**: Removed badge fallback ("M") since it has the same limitations as icons
- Simplified visual feedback: No more badge clutter on the toolbar icon
- Focused approach: Extension focuses on core mute/unmute functionality with notifications
- Same reliable operation: Mute/unmute still works perfectly from any tab

### v1.0.5
- **ULTRA-CLEAN VERSION**: Removed almost all console logging for clean debugging experience
- Improved error handling: No more console errors when no Meet tabs are found
- Simplified notifications: Shows helpful user notifications instead of console messages
- Silent operation: Extension works quietly in background without verbose logging
- Badge fallback remains: Still shows "M" badge when muted if icon updates fail

### v1.0.4
- **SIMPLIFIED VERSION**: Reduced excessive logging while keeping essential debugging info
- Added badge fallback: If icon updates fail, shows "M" badge on muted state
- Improved icon update timing with queued execution
- Streamlined retry logic - simpler and more reliable
- Cleaner console output for easier troubleshooting

### v1.0.3
- **DEBUGGING VERSION**: Added extensive debugging for toolbar icon update issues
- Enhanced error handling and logging for `chrome.action.setIcon()` failures
- Added retry logic with multiple alternative methods for icon updates
- Comprehensive logging with emojis for easier troubleshooting in console
- All icon update calls now use retry mechanism with fallback approaches

### v1.0.2
- **MAJOR IMPROVEMENT**: Fixed icon sync issues when using shortcuts from non-Meet tabs
- Enhanced state verification with multiple retry attempts and extended delays
- Added real-time mute state monitoring to detect manual changes in Google Meet
- Improved tab switching logic with aggressive icon sync when returning to Meet tabs
- Enhanced mute state detection with better visual and attribute checking
- Added comprehensive logging for troubleshooting state sync issues

### v1.0.1
- **CRITICAL FIX**: Prevented extension from accidentally clicking "mute all" host controls
- Added strict safety checks to only target personal microphone button
- Improved button detection with exclusion filters for host/admin controls
- Enhanced logging for debugging and safety verification
- Added manual sync button for icon state recovery

### v1.0.0
- Initial release
- Basic mute/unmute functionality
- Keyboard shortcut support
- Extension popup interface
- Google Meet integration
