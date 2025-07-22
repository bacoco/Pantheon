# QR Code Generator for BACO

A simple ASCII-based QR code representation for mobile preview URLs.

## Overview

Since BACO runs in Claude Code without external dependencies, this provides a visual representation of URLs for mobile access.

## Implementation

### ASCII QR Representation
```typescript
class QRGenerator {
  static generate(url: string): string {
    // For actual implementation, we'd use a QR library
    // This creates a placeholder visual representation
    return this.createVisualPlaceholder(url);
  }
  
  private static createVisualPlaceholder(url: string): string {
    const width = 25;
    const height = 25;
    const lines: string[] = [];
    
    // Top border
    lines.push('█'.repeat(width));
    
    // QR pattern simulation (simplified)
    for (let i = 0; i < height - 2; i++) {
      let line = '█';
      
      // Corner squares (QR markers)
      if (i < 7 || i >= height - 9) {
        if (i % 2 === 0) {
          line += '██ ███ ██ ███ ██ ███ █';
        } else {
          line += ' ██ █ ██ █ ██ █ ██ █ ';
        }
      } else {
        // Data area (randomized for visual effect)
        for (let j = 0; j < width - 2; j++) {
          line += Math.random() > 0.5 ? '█' : ' ';
        }
      }
      
      line += '█';
      lines.push(line);
    }
    
    // Bottom border
    lines.push('█'.repeat(width));
    
    return lines.join('\n');
  }
}
```

### URL Display Helper
```typescript
class MobileURLDisplay {
  static format(port: number): string {
    const urls = this.getLocalNetworkURLs(port);
    
    return `
📱 Mobile Preview Available!
════════════════════════════

For mobile testing, use one of these URLs:

${urls.map(url => `  📍 ${url}`).join('\n')}

Instructions:
1. Ensure your mobile device is on the same Wi-Fi network
2. Open your mobile browser
3. Enter one of the URLs above
4. The dev server will hot-reload changes

Troubleshooting:
- If you can't connect, check your firewall settings
- Make sure the dev server is running
- Try using the IP address instead of localhost
`;
  }
  
  private static getLocalNetworkURLs(port: number): string[] {
    // In a real implementation, we'd detect actual network interfaces
    // For now, we'll show common patterns
    return [
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
      `http://[your-computer-ip]:${port}`,
      `http://192.168.1.x:${port} (replace x with your IP)`
    ];
  }
}
```

### Visual URL Box
```typescript
class VisualURL {
  static create(url: string): string {
    const padding = 4;
    const width = url.length + (padding * 2) + 2;
    
    const top = '╔' + '═'.repeat(width - 2) + '╗';
    const bottom = '╚' + '═'.repeat(width - 2) + '╝';
    const middle = `║${' '.repeat(padding)}${url}${' '.repeat(padding)}║`;
    
    return `
${top}
${middle}
${bottom}

Alternative: Open your phone's camera and point at this "QR code":

█████████████████████████
██ ▄▄▄▄▄ █▀▀█▄█ ▄▄▄▄▄ ██
██ █   █ █▀▄▀▄█ █   █ ██
██ █▄▄▄█ █▄█ ▀█ █▄▄▄█ ██
██▄▄▄▄▄▄▄█▄█▄█▄▄▄▄▄▄▄██
██▄▄▀ ▄▄▄▄▀█ ▀▄█▄█▄▀████
██▄▀▄▄▄▄▀▄ ▄▀▄▄ ▄▀▀▄████
███▄█▄▄█▄███▄██▄▄█▄██████
██ ▄▄▄▄▄ █▄▄█▄▄█▄ ▄▄████
██ █   █ █ ▄█▀ ▄▄█▄▀████
██ █▄▄▄█ █ ▄▀▄▀▄▀█▄█████
██▄▄▄▄▄▄▄█▄▄▄█▄███▄▄████
█████████████████████████

(Note: This is a placeholder - in production, install a QR library)
`;
  }
}
```

## Usage in BACO

### Integration with Live Preview
```typescript
// In live preview command
function displayMobilePreview(port: number, url: string) {
  console.log('\n' + MobileURLDisplay.format(port));
  console.log(VisualURL.create(url));
  
  console.log(`
📱 Quick Setup Guide:
════════════════════
1. On your computer: Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
2. Find your IP address (usually starts with 192.168...)
3. On your phone: Open browser to http://[your-ip]:${port}

Example: If your IP is 192.168.1.100
URL: http://192.168.1.100:${port}
`);
}
```

### Network Detection Simulation
```typescript
class NetworkInfo {
  static async getAccessURLs(port: number): Promise<string[]> {
    // In real implementation, we'd use os.networkInterfaces()
    // For now, provide helpful guidance
    
    const urls: string[] = [
      `http://localhost:${port}`
    ];
    
    // Add platform-specific help
    const platform = process.platform;
    
    if (platform === 'win32') {
      urls.push('Run "ipconfig" to find your IP address');
    } else if (platform === 'darwin') {
      urls.push('Run "ifconfig | grep inet" to find your IP');
    } else {
      urls.push('Run "hostname -I" to find your IP address');
    }
    
    return urls;
  }
}
```

## Alternative Approaches

### 1. Copy-Paste URL Method
```typescript
class SimpleURLShare {
  static display(port: number): void {
    console.log(`
📱 Mobile Preview Setup
══════════════════════

1. Find your computer's IP address:
   • Windows: Open CMD → type 'ipconfig'
   • Mac: Open Terminal → type 'ifconfig'
   • Linux: Open Terminal → type 'hostname -I'

2. Look for IPv4 Address (like 192.168.1.123)

3. On your phone, open:
   http://[YOUR-IP]:${port}

Example:
   http://192.168.1.123:${port}

💡 Pro tip: Both devices must be on same Wi-Fi!
`);
  }
}
```

### 2. URL Shortener Suggestion
```typescript
class URLShorteningSuggestion {
  static suggest(url: string): void {
    console.log(`
📱 Easy Mobile Access
═══════════════════

Your local URL: ${url}

For easier mobile access, consider:
1. Using a service like ngrok for temporary public URLs
2. Setting up port forwarding on your router
3. Using your computer's hostname if on same network

Quick ngrok setup:
1. Install: npm install -g ngrok
2. Run: ngrok http ${url.split(':').pop()}
3. Use the generated URL on any device!
`);
  }
}
```

## Best Practices

1. **Clear Instructions**: Always provide step-by-step network setup
2. **Multiple Options**: Offer various ways to access (IP, hostname, etc.)
3. **Troubleshooting**: Include common network issues and solutions
4. **Visual Aids**: Use ASCII art to make URLs stand out
5. **Platform Awareness**: Provide OS-specific commands

Note: For production use, consider integrating actual QR code libraries for better mobile experience.