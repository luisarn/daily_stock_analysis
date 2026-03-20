import i18n from '../i18n';
import type { Message } from '../stores/agentChatStore';

/**
 * Format chat messages as Markdown for export.
 */
export function formatSessionAsMarkdown(messages: Message[]): string {
  const t = i18n.t.bind(i18n);
  const locale = i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US';
  const now = new Date();
  const timeStr = now.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [
    `# ${t('chat:pageHeading')}`,
    '',
    `${t('chat:exportGeneratedAt', { time: timeStr })}`,
    '',
  ];

  for (const msg of messages) {
    const roleLabel =
      msg.role === 'user'
        ? t('chat:exportUserHeading')
        : t('chat:exportAiHeading');
    if (msg.role === 'assistant' && msg.strategyName) {
      lines.push(`## ${roleLabel} (${msg.strategyName})`);
    } else {
      lines.push(`## ${roleLabel}`);
    }
    lines.push('');
    lines.push(msg.content);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Trigger browser download of session as .md file.
 * Revokes object URL after download to prevent memory leak.
 */
export function downloadSession(messages: Message[]): void {
  const content = formatSessionAsMarkdown(messages);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = pad(now.getHours()) + pad(now.getMinutes());
  const filename = `${i18n.t('chat:pageHeading')}_${dateStr}_${timeStr}.md`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
