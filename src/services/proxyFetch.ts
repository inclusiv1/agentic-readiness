export interface ProxyResponse {
  contents: string;
  status: number;
  error?: string;
}

const PROXIES = [
  // Local proxy (highest priority if running locally)
  {
    name: 'local',
    getUrl: (target: string) => `http://localhost:3001/proxy?url=${encodeURIComponent(target)}`,
    isLocal: true
  },
  // User requested proxies
  {
    name: 'allorigins',
    getUrl: (target: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`,
    parse: (data: any) => data.contents
  },
  {
    name: 'codetabs',
    getUrl: (target: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
    parse: (data: any) => typeof data === 'string' ? data : JSON.stringify(data)
  },
  {
    name: 'corsproxy.io',
    getUrl: (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`
  },
  {
    name: 'marc-penner',
    getUrl: (target: string) => `https://readiness-proxy.marc-penner.workers.dev/?url=${encodeURIComponent(target)}`
  },
  {
    name: 'corsproxy.github.io',
    getUrl: (target: string) => `https://corsproxy.github.io/${target.replace(/^https?:\/\//, '')}`
  },
  {
    name: 'cors-anywhere',
    getUrl: (target: string) => `https://cors-anywhere.herokuapp.com/${target}`
  },
  {
    name: 'thingproxy',
    getUrl: (target: string) => `https://thingproxy.freeboard.io/fetch/${target}`
  }
];

export async function proxyFetch(targetUrl: string, options: { method?: string, headers?: Record<string, string>, body?: any, timeout?: number } = {}): Promise<ProxyResponse> {
  const isLocalEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const timeout = options.timeout || 8000; // 8 second timeout per proxy
  
  // Reorder proxies: if local, put 'local' first. Otherwise, skip local.
  const activeProxies = isLocalEnv 
    ? PROXIES 
    : PROXIES.filter(p => !p.isLocal);

  let lastError: any = null;

  for (const proxy of activeProxies) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`Attempting ${options.method || 'GET'} via ${proxy.name}: ${targetUrl}`);
      const proxyUrl = proxy.getUrl(targetUrl);
      
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: options.headers,
        signal: controller.signal
      };

      if (options.body) {
        fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      }

      const response = await fetch(proxyUrl, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} from ${proxy.name}`);
      }

      let contents = '';
      
      // Some proxies return plain text directly, some return JSON
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (proxy.parse) {
          contents = proxy.parse(data);
        } else if (data.contents !== undefined) {
          contents = data.contents;
        } else if (typeof data === 'string') {
          contents = data;
        } else {
          contents = JSON.stringify(data);
        }
      } else {
        contents = await response.text();
      }

      return {
        contents,
        status: response.status
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn(`Proxy ${proxy.name} timed out for ${targetUrl}`);
      } else {
        console.warn(`Proxy ${proxy.name} failed:`, err);
      }
      lastError = err;
      continue; // Try next proxy
    }
  }

  return {
    contents: '',
    status: 500,
    error: lastError?.message || 'All proxies failed'
  };
}
