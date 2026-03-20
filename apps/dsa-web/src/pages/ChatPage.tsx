import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { agentApi } from '../api/agent';
import { ApiErrorAlert, Button, ConfirmDialog, ScrollArea } from '../components/common';
import { getParsedApiError } from '../api/error';
import type { StrategyInfo } from '../api/agent';
import { historyApi } from '../api/history';
import {
  useAgentChatStore,
  type Message,
  type ProgressStep,
} from '../stores/agentChatStore';
import { downloadSession, formatSessionAsMarkdown } from '../utils/chatExport';
import { isNearBottom } from '../utils/chatScroll';

interface FollowUpContext {
  stock_code: string;
  stock_name: string | null;
  previous_analysis_summary?: unknown;
  previous_strategy?: unknown;
  previous_price?: number;
  previous_change_pct?: number;
}

// Quick question strategies (static; labels are translated inside component)
const QUICK_QUESTION_STRATEGIES = [
  'chan_theory',
  'wave_theory',
  'trend',
  'box_oscillation',
  'general',
  'sentiment',
];

const ChatPage: React.FC = () => {
  const { t, i18n } = useTranslation(['chat', 'common']);
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('bull_trend');
  const [showStrategyDesc, setShowStrategyDesc] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialFollowUpHandled = useRef(false);
  const followUpContextRef = useRef<FollowUpContext | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const pendingScrollBehaviorRef = useRef<ScrollBehavior>('auto');

  // Build QUICK_QUESTIONS inside component so labels are reactive to language
  const quickLabels = t('quickQuestions', { returnObjects: true }) as string[];
  const QUICK_QUESTIONS = QUICK_QUESTION_STRATEGIES.map((strategy, i) => ({
    label: quickLabels[i] ?? strategy,
    strategy,
  }));

  // Set page title
  useEffect(() => {
    document.title = t('title');
  }, [t]);

  const {
    messages,
    loading,
    progressSteps,
    sessionId,
    sessions,
    sessionsLoading,
    chatError,
    loadSessions,
    loadInitialSession,
    switchSession,
    startStream,
    clearCompletionBadge,
  } = useAgentChatStore();

  const syncScrollState = useCallback(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    shouldStickToBottomRef.current = isNearBottom({
      scrollTop: viewport.scrollTop,
      clientHeight: viewport.clientHeight,
      scrollHeight: viewport.scrollHeight,
    });
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const requestScrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    shouldStickToBottomRef.current = true;
    pendingScrollBehaviorRef.current = behavior;
  }, []);

  const handleMessagesScroll = useCallback(() => {
    syncScrollState();
  }, [syncScrollState]);

  useEffect(() => {
    syncScrollState();
  }, [syncScrollState, sessionId]);

  useEffect(() => {
    const behavior = pendingScrollBehaviorRef.current;
    const shouldAutoScroll = shouldStickToBottomRef.current;
    if (!shouldAutoScroll) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToBottom(behavior);
      pendingScrollBehaviorRef.current = loading ? 'auto' : 'smooth';
    });

    return () => window.cancelAnimationFrame(frame);
  }, [messages, progressSteps, loading, sessionId, scrollToBottom]);

  useEffect(() => {
    if (!loading) {
      pendingScrollBehaviorRef.current = 'smooth';
    }
  }, [loading]);

  useEffect(() => {
    clearCompletionBadge();
  }, [clearCompletionBadge]);

  useEffect(() => {
    loadInitialSession();
  }, [loadInitialSession]);

  useEffect(() => {
    agentApi.getStrategies().then((res) => {
      setStrategies(res.strategies);
      const defaultId =
        res.strategies.find((s) => s.id === 'bull_trend')?.id ||
        res.strategies[0]?.id ||
        '';
      setSelectedStrategy(defaultId);
    }).catch(() => {});
  }, []);

  const handleStartNewChat = useCallback(() => {
    followUpContextRef.current = null;
    requestScrollToBottom('auto');
    useAgentChatStore.getState().startNewChat();
    setSidebarOpen(false);
  }, [requestScrollToBottom]);

  const handleSwitchSession = useCallback((targetSessionId: string) => {
    requestScrollToBottom('auto');
    switchSession(targetSessionId);
    setSidebarOpen(false);
  }, [requestScrollToBottom, switchSession]);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirmId) return;
    agentApi.deleteChatSession(deleteConfirmId).then(() => {
      loadSessions();
      if (deleteConfirmId === sessionId) {
        handleStartNewChat();
      }
    }).catch(() => {});
    setDeleteConfirmId(null);
  }, [deleteConfirmId, sessionId, loadSessions, handleStartNewChat]);

  // Handle follow-up from report page: ?stock=600519&name=贵州茅台&recordId=xxx
  useEffect(() => {
    if (initialFollowUpHandled.current) return;
    const stock = searchParams.get('stock');
    const name = searchParams.get('name');
    const recordId = searchParams.get('recordId');
    if (stock) {
      initialFollowUpHandled.current = true;
      const displayName = name ? `${name}(${stock})` : stock;
      setInput(t('followUp', { name: displayName }));
      if (recordId) {
        historyApi.getDetail(Number(recordId)).then((report) => {
          const ctx: FollowUpContext = { stock_code: stock, stock_name: name };
          if (report.summary) ctx.previous_analysis_summary = report.summary;
          if (report.strategy) ctx.previous_strategy = report.strategy;
          if (report.meta) {
            ctx.previous_price = report.meta.currentPrice;
            ctx.previous_change_pct = report.meta.changePct;
          }
          followUpContextRef.current = ctx;
        }).catch(() => {});
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

  const handleSend = useCallback(
    async (overrideMessage?: string, overrideStrategy?: string) => {
      const msgText = overrideMessage || input.trim();
      if (!msgText || loading) return;
      const usedStrategy = overrideStrategy || selectedStrategy;
      const usedStrategyName =
        strategies.find((s) => s.id === usedStrategy)?.name ||
        (usedStrategy ? usedStrategy : t('strategy.fallback'));

      const payload = {
        message: msgText,
        session_id: sessionId,
        strategies: usedStrategy ? [usedStrategy] : undefined,
        context: followUpContextRef.current ?? undefined,
      };
      followUpContextRef.current = null;

      setInput('');
      requestScrollToBottom('smooth');
      await startStream(payload, { strategyName: usedStrategyName });
    },
    [input, loading, requestScrollToBottom, selectedStrategy, strategies, sessionId, startStream, t],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (q: (typeof QUICK_QUESTIONS)[0]) => {
    setSelectedStrategy(q.strategy);
    handleSend(q.label, q.strategy);
  };

  const toggleThinking = (msgId: string) => {
    setExpandedThinking((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const getCurrentStage = (steps: ProgressStep[]): string => {
    if (steps.length === 0) return t('stage.connecting');
    const last = steps[steps.length - 1];
    if (last.type === 'thinking') return last.message || t('stage.thinking');
    if (last.type === 'tool_start')
      return `${last.display_name || last.tool}...`;
    if (last.type === 'tool_done')
      return t('stage.toolDone', { toolName: last.display_name || last.tool });
    if (last.type === 'generating')
      return last.message || t('stage.generating');
    return t('stage.processing');
  };

  const renderThinkingBlock = (msg: Message) => {
    if (!msg.thinkingSteps || msg.thinkingSteps.length === 0) return null;
    const isExpanded = expandedThinking.has(msg.id);
    const toolSteps = msg.thinkingSteps.filter((s) => s.type === 'tool_done');
    const totalDuration = toolSteps.reduce(
      (sum, s) => sum + (s.duration || 0),
      0,
    );
    const summary = t('thinking.summary', {
      toolCount: toolSteps.length,
      duration: totalDuration.toFixed(1),
    });

    return (
      <button
        onClick={() => toggleThinking(msg.id)}
        className="flex items-center gap-2 text-xs text-muted-text hover:text-secondary-text transition-colors mb-2 w-full text-left"
      >
        <svg
          className={`w-3 h-3 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="flex items-center gap-1.5">
          <span className="opacity-60">{t('thinking.title')}</span>
          <span className="text-muted-text/50">·</span>
          <span className="opacity-50">{summary}</span>
        </span>
      </button>
    );
  };

  const renderThinkingDetails = (steps: ProgressStep[]) => (
    <div className="mb-3 pl-5 border-l border-border/40 space-y-0.5 animate-fade-in">
      {steps.map((step, idx) => {
        let icon = '⋯';
        let text = '';
        let colorClass = 'text-muted-text';
        if (step.type === 'thinking') {
          icon = '🤔';
          text = step.message || t('thinking.step', { step: step.step });
          colorClass = 'text-secondary-text';
        } else if (step.type === 'tool_start') {
          icon = '⚙️';
          text = `${step.display_name || step.tool}...`;
          colorClass = 'text-secondary-text';
        } else if (step.type === 'tool_done') {
          icon = step.success ? '✅' : '❌';
          text = `${step.display_name || step.tool} (${step.duration}s)`;
          colorClass = step.success ? 'text-green-400' : 'text-red-400';
        } else if (step.type === 'generating') {
          icon = '✍️';
          text = step.message || t('thinking.generating');
          colorClass = 'text-cyan';
        }
        return (
          <div
            key={idx}
            className={`flex items-center gap-2 text-xs py-0.5 ${colorClass}`}
          >
            <span className="w-4 flex-shrink-0 text-center">{icon}</span>
            <span className="leading-relaxed">{text}</span>
          </div>
        );
      })}
    </div>
  );

  const dateLocale = i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US';

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-white/5 bg-white/2 p-3.5">
        <h2 className="text-[11px] font-semibold text-cyan uppercase tracking-[0.2em] flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('history.title')}
        </h2>
        <button
          onClick={handleStartNewChat}
          className="rounded-lg p-1.5 text-muted-text transition-all hover:bg-white/10 hover:text-white"
          title={t('history.newChat')}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
      <ScrollArea testId="chat-session-list-scroll">
        {sessionsLoading ? (
          <div className="p-4 text-center text-xs text-muted-text">{t('history.loading')}</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-text">{t('history.empty')}</div>
        ) : (
          <div className="space-y-2 p-3">
            {sessions.map((s) => (
              <div
                key={s.session_id}
                role="button"
                tabIndex={0}
                onClick={() => handleSwitchSession(s.session_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSwitchSession(s.session_id);
                  }
                }}
                className={`group relative flex w-full cursor-pointer items-start gap-3 overflow-hidden rounded-xl border p-2.5 transition-all duration-200 ${
                  s.session_id === sessionId
                    ? 'border-cyan bg-cyan/10 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                    : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'
                }`}
                aria-label={t('history.switchTo', { title: s.title })}
              >
                {/* 装饰条 */}
                <div
                  className={`h-10 w-1 rounded-full flex-shrink-0 transition-colors ${
                    s.session_id === sessionId ? 'bg-cyan' : 'bg-white/10'
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-semibold tracking-tight transition-colors ${
                        s.session_id === sessionId ? 'text-white' : 'text-secondary-text group-hover:text-white'
                      }`}>
                        {s.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(s.session_id);
                      }}
                      className="flex-shrink-0 rounded p-1 text-muted-text opacity-0 transition-all hover:bg-white/10 hover:text-rose-400 group-hover:opacity-100"
                      title={t('history.delete')}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] text-muted-text">
                      {t('history.messageCount', { count: s.message_count })}
                    </span>
                    {s.last_active && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-white/10" />
                        <span className="text-[11px] text-muted-text">
                          {new Date(s.last_active).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );

  return (
    <div
      data-testid="chat-workspace"
      className="flex h-[calc(100vh-5rem)] w-full min-w-0 gap-4 overflow-hidden sm:h-[calc(100vh-5.5rem)] lg:h-[calc(100vh-2rem)]"
    >
      {/* Desktop sidebar */}
      <div className="hidden h-full w-64 flex-shrink-0 flex-col overflow-hidden rounded-[1.25rem] border border-white/8 bg-card/82 shadow-soft-card md:flex">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col glass-card overflow-hidden border-r border-white/10 bg-card/90 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title={t('deleteConfirm.title')}
        message={t('deleteConfirm.message')}
        confirmText={t('deleteConfirm.confirm')}
        cancelText={t('common:cancel')}
        isDanger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Main chat area */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="mb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-hover transition-colors text-secondary-text hover:text-foreground"
              title={t('history.mobileTitle')}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <svg
              className="w-6 h-6 text-cyan"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            {t('pageHeading')}
          </h1>
          <p className="text-secondary-text text-sm">
            {t('pageSubtitle')}
          </p>
          {messages.length > 0 && (
            <div className="mt-2 flex gap-2 items-center">
              <button
                type="button"
                onClick={() => downloadSession(messages)}
                className="px-3 py-1.5 rounded-lg text-sm text-secondary-text hover:text-foreground hover:bg-hover border border-border/70 transition-colors flex items-center gap-1.5"
                title={t('actions.export')}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {t('actions.exportLabel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (sending) return;
                  setSending(true);
                  setSendToast(null);
                  try {
                    const content = formatSessionAsMarkdown(messages);
                    await agentApi.sendChat(content);
                    setSendToast({ type: 'success', message: t('actions.sendSuccess') });
                    setTimeout(() => setSendToast(null), 3000);
                  } catch (err) {
                    const parsed = getParsedApiError(err);
                    setSendToast({
                      type: 'error',
                      message: parsed.message || t('actions.sendFailed'),
                    });
                    setTimeout(() => setSendToast(null), 5000);
                  } finally {
                    setSending(false);
                  }
                }}
                disabled={sending}
                className="px-3 py-1.5 rounded-lg text-sm text-secondary-text hover:text-foreground hover:bg-hover border border-border/70 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('actions.send')}
              >
                {sending ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
                {t('input.send')}
              </button>
              {sendToast && (
                <span
                  className={`text-sm ${sendToast.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
                >
                  {sendToast.message}
                </span>
              )}
            </div>
          )}
        </header>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden border border-white/6 bg-card/78 glass-card">
          {/* Messages */}
          <ScrollArea
            className="relative z-10 flex-1"
            viewportRef={messagesViewportRef}
            onScroll={handleMessagesScroll}
            viewportClassName="space-y-6 p-4 md:p-6"
            testId="chat-message-scroll"
          >
            {messages.length === 0 && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-card/70 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-muted-text"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t('emptyState.heading')}
                </h3>
                <p className="text-sm text-secondary-text max-w-sm mb-6">
                  {t('emptyState.description')}
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      className="px-3 py-1.5 rounded-full bg-card/70 border border-border/70 text-sm text-secondary-text hover:text-foreground hover:border-cyan/40 hover:bg-cyan/5 transition-all"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      msg.role === 'user'
                        ? 'bg-cyan text-black'
                        : 'bg-elevated text-foreground'
                    }`}
                  >
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div
                    className={`min-w-0 w-fit max-w-[min(100%,48rem)] overflow-hidden rounded-2xl px-5 py-3.5 ${
                      msg.role === 'user'
                        ? 'bg-cyan/10 text-white border border-cyan/20 rounded-tr-sm'
                        : 'bg-card/72 text-secondary-text border border-white/30 rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && msg.strategyName && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan/10 border border-cyan/20 text-xs text-cyan">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          {msg.strategyName}
                        </span>
                      </div>
                    )}
                    {msg.role === 'assistant' && renderThinkingBlock(msg)}
                    {msg.role === 'assistant' &&
                      expandedThinking.has(msg.id) &&
                      msg.thinkingSteps &&
                      renderThinkingDetails(msg.thinkingSteps)}
                    {msg.role === 'assistant' ? (
                      <div
                        className="prose prose-invert prose-sm max-w-none
                      prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5
                      prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                      prose-p:mb-2 prose-p:last:mb-0 prose-p:leading-7 prose-p:break-words
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-li:break-words
                      prose-code:text-cyan prose-code:bg-card/70 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:break-all
                      prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:bg-black/30 prose-pre:border prose-pre:border-border/70 prose-pre:rounded-lg prose-pre:p-3
                      prose-table:w-full prose-table:text-sm
                      prose-th:text-foreground prose-th:font-medium prose-th:border-border prose-th:px-3 prose-th:py-1.5 prose-th:bg-card/70
                      prose-td:border-border/70 prose-td:px-3 prose-td:py-1.5
                      prose-hr:border-border/70 prose-hr:my-3
                      prose-a:text-cyan prose-a:no-underline hover:prose-a:underline
                      prose-blockquote:border-cyan/30 prose-blockquote:text-secondary-text
                      [&_table]:block [&_table]:overflow-x-auto [&_table]:whitespace-nowrap
                      [&_img]:max-w-full
                    "
                      >
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </Markdown>
                      </div>
                    ) : (
                      msg.content
                        .split('\n')
                        .map((line, i) => (
                          <p
                            key={i}
                            className="mb-1 last:mb-0 leading-relaxed"
                          >
                            {line || '\u00A0'}
                          </p>
                        ))
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-elevated text-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  AI
                </div>
                <div className="min-w-[200px] max-w-[min(100%,48rem)] overflow-hidden rounded-2xl rounded-tl-sm border border-white/6 bg-card/72 px-5 py-4">
                  <div className="flex items-center gap-2.5 text-sm text-secondary-text">
                    <div className="relative w-4 h-4 flex-shrink-0">
                      <div className="absolute inset-0 rounded-full border-2 border-cyan/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
                    </div>
                    <span className="text-secondary-text">
                      {getCurrentStage(progressSteps)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input area */}
          <div className="p-4 md:p-6 border-t border-white/6 bg-card/88 relative z-20">
            {chatError ? (
              <ApiErrorAlert error={chatError} className="mb-3" />
            ) : null}
            {strategies.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 items-start">
                <span className="text-xs text-muted-text font-medium uppercase tracking-wider flex-shrink-0 mt-1">
                  {t('strategy.label')}
                </span>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer group mt-0.5">
                  <input
                    type="radio"
                    name="strategy"
                    value=""
                    checked={selectedStrategy === ''}
                    onChange={() => setSelectedStrategy('')}
                    className="w-3.5 h-3.5 accent-cyan"
                  />
                  <span
                    className={`transition-colors text-sm ${selectedStrategy === '' ? 'text-foreground font-medium' : 'text-secondary-text group-hover:text-foreground'}`}
                  >
                    {t('strategy.generic')}
                  </span>
                </label>
                {strategies.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-1.5 cursor-pointer group relative mt-0.5"
                    onMouseEnter={() => setShowStrategyDesc(s.id)}
                    onMouseLeave={() => setShowStrategyDesc(null)}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      value={s.id}
                      checked={selectedStrategy === s.id}
                      onChange={() => setSelectedStrategy(s.id)}
                      className="w-3.5 h-3.5 accent-cyan"
                    />
                    <span
                      className={`transition-colors text-sm ${selectedStrategy === s.id ? 'text-foreground font-medium' : 'text-secondary-text group-hover:text-foreground'}`}
                    >
                      {s.name}
                    </span>
                    {showStrategyDesc === s.id && s.description && (
                      <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-2.5 rounded-lg bg-elevated border border-border/70 shadow-xl text-xs text-secondary-text leading-relaxed pointer-events-none animate-fade-in">
                        <p className="font-medium text-foreground mb-1">{s.name}</p>
                        <p>{s.description}</p>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('input.placeholder')}
                disabled={loading}
                rows={1}
                className="input-terminal flex-1 min-h-[44px] max-h-[200px] py-2.5 resize-none"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
              />
              <Button
                variant="primary"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                isLoading={loading}
                className="h-[44px] px-6 flex-shrink-0"
              >
                {t('input.send')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
