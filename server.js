const express = require('express');
const http = require('http');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MAC_PORT = 8765;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// ===================== MAC SERVER =====================
const macServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/macs' && req.method === 'GET') {
        getNetworkInfo(res);
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

function getNetworkInfo(res) {
    const isWin = process.platform === 'win32';
    const isLinux = process.platform === 'linux';
    const isMac = process.platform === 'darwin';

    if (isWin) {
        exec('ipconfig /all', (err, stdout) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                return;
            }
            const macs = parseWindowsOutput(stdout);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(macs));
        });
    } else if (isLinux) {
        exec('cat /sys/class/net/*/address 2>/dev/null; ip addr show 2>/dev/null', (err, stdout) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                return;
            }
            const macs = parseLinuxOutput(stdout);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(macs));
        });
    } else if (isMac) {
        exec('ifconfig 2>/dev/null', (err, stdout) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                return;
            }
            const macs = parseMacOutput(stdout);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(macs));
        });
    } else {
        // Fallback to OS module
        const interfaces = os.networkInterfaces();
        const macs = [];
        for (const [name, ifaces] of Object.entries(interfaces)) {
            for (const iface of ifaces) {
                if (!iface.internal) {
                    macs.push({
                        name,
                        mac: iface.mac,
                        ip: iface.address,
                        family: iface.family,
                        internal: iface.internal
                    });
                }
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ macs, platform: process.platform }));
    }
}

function parseWindowsOutput(output) {
    const macRegex = /([0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2})/g;
    const allMacMatches = output.match(macRegex) || [];
    const uniqueMacs = [...new Set(allMacMatches)].map(m => m.replace(/-/g, ':'));
    
    const ipRegex = /(\d+\.\d+\.\d+\.\d+)/g;
    const allIPMatches = output.match(ipRegex) || [];
    const uniqueIPs = [...new Set(allIPMatches)];
    
    const primaryMac = uniqueMacs.find(m => 
        m !== '00:00:00:00:00:00' && m !== 'FF:FF:FF:FF:FF:FF'
    ) || uniqueMacs[0] || 'N/A';

    return {
        platform: 'windows',
        primaryMac,
        allMacs: uniqueMacs,
        allIPs: uniqueIPs
    };
}

function parseLinuxOutput(output) {
    const macRegex = /([0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5})/g;
    const macs = output.match(macRegex) || [];
    const uniqueMacs = [...new Set(macs)];

    const ipRegex = /inet (\d+\.\d+\.\d+\.\d+)/g;
    const ips = [];
    let match;
    while ((match = ipRegex.exec(output)) !== null) {
        ips.push(match[1]);
    }

    return {
        platform: 'linux',
        primaryMac: uniqueMacs.find(m => m !== '00:00:00:00:00:00') || uniqueMacs[0] || 'N/A',
        allMacs: uniqueMacs,
        allIPs: ips
    };
}

function parseMacOutput(output) {
    const macRegex = /([0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5})/g;
    const macs = output.match(macRegex) || [];
    const uniqueMacs = [...new Set(macs)];

    const ipRegex = /inet (\d+\.\d+\.\d+\.\d+)/g;
    const ips = [];
    let match;
    while ((match = ipRegex.exec(output)) !== null) {
        ips.push(match[1]);
    }

    return {
        platform: 'macos',
        primaryMac: uniqueMacs.find(m => !m.startsWith('00:00:00:')) || uniqueMacs[0] || 'N/A',
        allMacs: uniqueMacs,
        allIPs: ips
    };
}

// Start MAC server first
macServer.listen(MAC_PORT, '0.0.0.0', () => {
    console.log(`\n===========================================`);
    console.log(`  🌐 MAC Server running on port ${MAC_PORT}`);
    console.log(`  📡 Endpoint: http://localhost:${MAC_PORT}/api/macs`);
    console.log(`===========================================\n`);
});

// Start main server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n===========================================`);
    console.log(`  🚀 ReallyWorld running on port ${PORT}`);
    console.log(`  🌐 Open: http://localhost:${PORT}`);
    console.log(`  📡 MAC API: http://localhost:${MAC_PORT}/api/macs`);
    console.log(`===========================================\n`);
});
