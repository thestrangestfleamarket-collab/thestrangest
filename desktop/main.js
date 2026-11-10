// The Windows app: THE MARKET from thestrangestfleamarket.com in its own window (owner, 10 Nov 2026).
const { app, BrowserWindow, shell, Menu } = require('electron');
const SITE = 'https://thestrangestfleamarket.com/';
const HOST = new URL(SITE).host;

if (!app.requestSingleInstanceLock()) app.quit();

function open() {
  const win = new BrowserWindow({
    width: 1600, height: 900, backgroundColor: '#000000', autoHideMenuBar: true,
    title: 'The Strangest Flea Market',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false }
  });
  Menu.setApplicationMenu(null);
  win.maximize();
  const ours = u => { try { return new URL(u).host === HOST; } catch (e) { return false; } };
  win.webContents.setWindowOpenHandler(({ url }) => { if (!ours(url)) shell.openExternal(url); return { action: ours(url) ? 'allow' : 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!ours(url)) { e.preventDefault(); shell.openExternal(url); } });
  win.webContents.on('before-input-event', (e, k) => {
    if (k.type !== 'keyDown') return;
    if (k.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    else if (k.key === 'F5' || (k.control && k.key.toLowerCase() === 'r')) { win.webContents.reload(); e.preventDefault(); }
  });
  win.webContents.on('did-fail-load', (e, code, desc, url, main) => {
    if (main && code !== -3) win.loadURL('data:text/html,' + encodeURIComponent('<body style="background:#000;color:#ccc;font:16px monospace;display:grid;place-items:center;height:100vh;margin:0"><div>THE MARKET could not be reached (' + desc + ').<br><br>Check your connection, then press F5.</div></body>'));
  });
  win.loadURL(SITE);
  app.on('second-instance', () => { if (win.isMinimized()) win.restore(); win.focus(); });
}

app.whenReady().then(open);
app.on('window-all-closed', () => app.quit());
