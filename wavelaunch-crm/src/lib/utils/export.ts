// Export utilities for generating downloadable files

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Handle special cases
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export function exportMessagesToText(messages: any[], filename: string) {
  const textContent = messages.map(msg => {
    const sender = msg.isFromAdmin ? 'Wavelaunch Team' : 'You'
    const date = new Date(msg.createdAt).toLocaleString()
    const attachment = msg.attachmentUrl ? `\n[Attachment: ${msg.attachmentName}]` : ''
    return `[${date}] ${sender}:\n${msg.body}${attachment}\n`
  }).join('\n' + '-'.repeat(80) + '\n\n')

  const blob = new Blob([textContent], { type: 'text/plain' })
  downloadBlob(blob, filename)
}

export function exportConversationToHTML(conversation: {
  subject: string
  messages: any[]
  creatorName?: string
}, filename: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${conversation.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .message {
      background: #fff;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .sender {
      font-weight: 600;
      color: #333;
    }
    .sender.admin {
      color: #6366f1;
    }
    .date {
      font-size: 12px;
      color: #999;
    }
    .message-body {
      color: #444;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .attachment {
      margin-top: 10px;
      padding: 8px 12px;
      background: #f0f0f0;
      border-radius: 4px;
      font-size: 14px;
    }
    .attachment a {
      color: #6366f1;
      text-decoration: none;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${conversation.subject}</h1>
    <p>Conversation exported on ${new Date().toLocaleString()}</p>
    ${conversation.creatorName ? `<p>With: ${conversation.creatorName}</p>` : ''}
  </div>

  ${conversation.messages.map(msg => `
    <div class="message">
      <div class="message-header">
        <span class="sender ${msg.isFromAdmin ? 'admin' : ''}">${msg.isFromAdmin ? 'Wavelaunch Team' : 'You'}</span>
        <span class="date">${new Date(msg.createdAt).toLocaleString()}</span>
      </div>
      <div class="message-body">${escapeHtml(msg.body)}</div>
      ${msg.attachmentUrl ? `
        <div class="attachment">
          📎 Attachment: <a href="${msg.attachmentUrl}" target="_blank">${msg.attachmentName || 'File'}</a>
        </div>
      ` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p>This conversation was exported from Wavelaunch Client Portal</p>
  </div>
</body>
</html>
  `.trim()

  const blob = new Blob([html], { type: 'text/html' })
  downloadBlob(blob, filename)
}

// Helper function to download blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
