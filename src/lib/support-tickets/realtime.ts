import request from '@/framework/utils/request';

export interface SupportRealtimeConfig {
  key: string;
  url: string;
  authEndpoint: string;
}

type EventHandler = (event: string, payload: any) => void;
type StateListener = (connected: boolean) => void;

const PROTOCOL_QUERY = 'protocol=7&client=js&version=8.4.0&flash=false';

function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_ENDPOINT || '';
  return base.replace(/\/+$/, '').replace(/\/admin$/, '');
}

function defaultAuthEndpoint(): string {
  return `${apiOrigin()}/broadcasting/auth`;
}

function resolveAuthEndpoint(value: unknown): string {
  if (typeof value !== 'string' || !value) return defaultAuthEndpoint();
  if (/^https?:\/\//i.test(value)) return value;
  try {
    return new URL(value, apiOrigin() || window.location.origin).toString();
  } catch {
    return defaultAuthEndpoint();
  }
}

/**
 * The backend exposes the same realtime config as the mobile app. Accept the
 * common Reverb / Pusher key spellings, nested or flat.
 */
export function normalizeRealtimeConfig(raw: any): SupportRealtimeConfig | null {
  const root = raw?.data ?? raw;
  if (!root || typeof root !== 'object') return null;
  const c =
    root.realtime ?? root.reverb ?? root.pusher ?? root.broadcasting ?? root.websocket ?? root;
  const options = c.options ?? {};

  if (c.enabled === false) return null;
  const key = c.key ?? c.app_key ?? c.appKey ?? options.key;
  if (!key) return null;

  const cluster = c.cluster ?? options.cluster;
  const host = c.host ?? c.ws_host ?? c.wsHost ?? options.host ?? options.wsHost;
  const scheme: string | undefined = c.scheme ?? options.scheme;
  const forceTLS =
    c.force_tls ?? c.forceTLS ?? c.use_tls ?? c.encrypted ?? options.forceTLS ?? options.useTLS;
  const secure =
    scheme !== undefined
      ? scheme === 'https' || scheme === 'wss'
      : forceTLS !== undefined
        ? Boolean(forceTLS)
        : typeof window !== 'undefined' && window.location.protocol === 'https:';

  let url: string;
  if (typeof c.url === 'string' && /^wss?:\/\//.test(c.url)) {
    url = `${c.url.replace(/\/+$/, '')}/app/${key}?${PROTOCOL_QUERY}`;
  } else if (host) {
    const port =
      (secure ? c.wss_port ?? c.wssPort ?? options.wssPort : c.ws_port ?? c.wsPort ?? options.wsPort) ??
      c.port ??
      options.port;
    const portPart = port ? `:${port}` : '';
    const path = (c.path ?? options.wsPath ?? '').replace(/\/+$/, '');
    url = `${secure ? 'wss' : 'ws'}://${host}${portPart}${path}/app/${key}?${PROTOCOL_QUERY}`;
  } else if (cluster) {
    url = `wss://ws-${cluster}.pusher.com:443/app/${key}?${PROTOCOL_QUERY}`;
  } else {
    return null;
  }

  return {
    key: String(key),
    url,
    authEndpoint: resolveAuthEndpoint(
      c.auth_endpoint ?? c.authEndpoint ?? c.auth_url ?? root.auth_endpoint
    ),
  };
}

function parseData(data: unknown): any {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

/** Laravel broadcasts with `broadcastAs()` arrive as-is; Echo-style names may start with a dot. */
function normalizeEventName(name: string) {
  return name.startsWith('.') ? name.slice(1) : name;
}

class SupportRealtimeConnection {
  private ws: WebSocket | null = null;
  private socketId: string | null = null;
  private channels = new Map<string, Set<EventHandler>>();
  private subscribed = new Set<string>();
  private stateListeners = new Set<StateListener>();
  private connected = false;
  private retries = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private activityTimer: ReturnType<typeof setTimeout> | null = null;
  private pongTimer: ReturnType<typeof setTimeout> | null = null;
  private activityTimeout = 120_000;
  private stopped = false;

  constructor(private config: SupportRealtimeConfig) {}

  get configKey() {
    return `${this.config.url}|${this.config.authEndpoint}`;
  }

  isConnected() {
    return this.connected;
  }

  onStateChange(listener: StateListener) {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  subscribe(channel: string, handler: EventHandler) {
    let handlers = this.channels.get(channel);
    if (!handlers) {
      handlers = new Set();
      this.channels.set(channel, handlers);
    }
    handlers.add(handler);
    this.ensureSocket();
    if (this.socketId && !this.subscribed.has(channel)) {
      void this.sendSubscribe(channel);
    }

    return () => {
      const set = this.channels.get(channel);
      if (!set) return;
      set.delete(handler);
      if (set.size === 0) {
        this.channels.delete(channel);
        if (this.subscribed.has(channel)) {
          this.subscribed.delete(channel);
          this.send('pusher:unsubscribe', { channel });
        }
      }
      if (this.channels.size === 0) this.stop();
    };
  }

  private setConnected(value: boolean) {
    if (this.connected === value) return;
    this.connected = value;
    this.stateListeners.forEach((listener) => listener(value));
  }

  private ensureSocket() {
    if (typeof window === 'undefined') return;
    this.stopped = false;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (this.reconnectTimer) return;
    this.open();
  }

  private open() {
    try {
      this.ws = new WebSocket(this.config.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws.onmessage = (e) => this.handleMessage(e.data);
    this.ws.onclose = () => {
      this.ws = null;
      this.socketId = null;
      this.subscribed.clear();
      this.setConnected(false);
      this.clearActivityTimers();
      if (!this.stopped) this.scheduleReconnect();
    };
    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect(delay?: number) {
    if (this.stopped || this.reconnectTimer) return;
    const wait = delay ?? Math.min(30_000, 1000 * 2 ** this.retries);
    this.retries += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.stopped && this.channels.size > 0) this.open();
    }, wait);
  }

  private stop() {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.clearActivityTimers();
    this.ws?.close();
    this.ws = null;
    this.socketId = null;
    this.subscribed.clear();
    this.setConnected(false);
  }

  private send(event: string, data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  private clearActivityTimers() {
    if (this.activityTimer) clearTimeout(this.activityTimer);
    if (this.pongTimer) clearTimeout(this.pongTimer);
    this.activityTimer = null;
    this.pongTimer = null;
  }

  private resetActivityTimer() {
    this.clearActivityTimers();
    this.activityTimer = setTimeout(() => {
      this.send('pusher:ping', {});
      this.pongTimer = setTimeout(() => this.ws?.close(), 30_000);
    }, this.activityTimeout);
  }

  private async sendSubscribe(channel: string) {
    const socketId = this.socketId;
    if (!socketId) return;
    this.subscribed.add(channel);
    try {
      let auth: string | undefined;
      if (channel.startsWith('private-') || channel.startsWith('presence-')) {
        const res = await request.post(this.config.authEndpoint, {
          socket_id: socketId,
          channel_name: channel,
        });
        auth = res.data?.auth ?? res.data?.data?.auth;
      }
      if (socketId !== this.socketId || !this.channels.has(channel)) return;
      this.send('pusher:subscribe', auth ? { channel, auth } : { channel });
    } catch {
      this.subscribed.delete(channel);
    }
  }

  private handleMessage(raw: string) {
    let message: any;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }
    this.resetActivityTimer();
    const event: string = message?.event ?? '';
    const data = parseData(message?.data);

    switch (event) {
      case 'pusher:connection_established': {
        this.socketId = data?.socket_id ?? null;
        if (data?.activity_timeout) {
          this.activityTimeout = Math.min(Number(data.activity_timeout) * 1000, 120_000);
        }
        this.retries = 0;
        this.channels.forEach((_, channel) => {
          void this.sendSubscribe(channel);
        });
        return;
      }
      case 'pusher:ping':
        this.send('pusher:pong', {});
        return;
      case 'pusher:pong':
        return;
      case 'pusher_internal:subscription_succeeded':
        this.setConnected(true);
        return;
      case 'pusher:subscription_error':
        if (message.channel) this.subscribed.delete(message.channel);
        return;
      case 'pusher:error': {
        const code = Number(data?.code);
        if (code >= 4000 && code < 4100) {
          this.stop();
        }
        return;
      }
    }

    if (event.startsWith('pusher')) return;
    const handlers = message?.channel ? this.channels.get(message.channel) : undefined;
    handlers?.forEach((handler) => handler(normalizeEventName(event), data));
  }
}

let shared: SupportRealtimeConnection | null = null;

export function getSupportRealtimeConnection(config: SupportRealtimeConfig) {
  const key = `${config.url}|${config.authEndpoint}`;
  if (!shared || shared.configKey !== key) {
    shared = new SupportRealtimeConnection(config);
  }
  return shared;
}

export const SUPPORT_INBOX_CHANNEL = 'private-support.inbox';
export const supportTicketChannel = (id: string | number) =>
  `private-support.staff.ticket.${id}`;
