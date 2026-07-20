export const commercePlatforms = [
  'Shopify', 'BigCommerce', 'Adobe Commerce (Magento)', 'Salesforce Commerce Cloud',
  'commercetools', 'SAP Commerce Cloud', 'Oracle CX Commerce', 'WooCommerce',
  'Wix eCommerce', 'Squarespace', 'Custom', 'Other', 'I don\'t know'
];

export const protocols = ['UCP', 'ACP', 'MCP', 'AP2', 'MCP app', 'Other', 'I don\'t know'];

export const platformMarkers = [
  { 
    name: 'Salesforce Commerce Cloud', 
    markers: ['demandware', 'dwvar', 'dwcontent', 'dw-session-id', 'demandware.edgesuite.net', 'salesforce-commerce', 'sfcc', '/on/demandware.store/'], 
    paths: ['/on/demandware.store/']
  },
  { 
    name: 'Shopify', 
    markers: ['shopify', 'cdn.shopify.com', 'shopify-payment-button', 'myshopify.com', '/cart.js'], 
    paths: ['/cart.js']
  },
  { 
    name: 'BigCommerce', 
    markers: ['bigcommerce', 'cdn11.bigcommerce.com', 'bc-api']
  },
  { 
    name: 'Adobe Commerce (Magento)', 
    markers: ['magento', 'mage-cache', 'varien', 'adobe-commerce', 'static/frontend/Magento', '/static/frontend/'], 
    paths: ['/static/frontend/']
  },
  { 
    name: 'WooCommerce', 
    markers: ['woocommerce', 'wp-content/plugins/woocommerce'], 
    paths: ['/wp-content/plugins/woocommerce/']
  },
  { 
    name: 'commercetools', 
    markers: ['commercetools', 'ct-api', 'commercetools.com']
  },
  { 
    name: 'SAP Commerce Cloud', 
    markers: ['hybris', 'sap-commerce', 'occ/v2', '/occ/v2/'], 
    paths: ['/occ/v2/']
  },
  { 
    name: 'Wix eCommerce', 
    markers: ['wix.com', 'wix-ecommerce', 'static.wixstatic.com', '_wix_']
  },
  { 
    name: 'Squarespace', 
    markers: ['squarespace.com', 'static1.squarespace.com']
  }
];

export const protocolMarkers = [
  { label: 'UCP 1.0', key: 'ucp', markers: ['ucp', 'universal-commerce', '.well-known/ucp'] },
  { label: 'ACP 1.1', key: 'acp', markers: ['acp', 'agent-commerce', 'handshake'] },
  { label: 'AP2', key: 'ap2', markers: ['ap2', 'agent-protocol'] },
  { label: 'MCP', key: 'mcp', markers: ['mcp', 'model-context-protocol'] },
  { label: 'llms.txt', key: 'llmsTxt', markers: ['llms.txt', 'llms.text', 'ai-context', 'openai', 'anthropic'] }
];

export const paymentMarkers = [
  { name: 'Stripe', markers: ['stripe.com', 'stripe.js', 'v3.stripe.com', 'stripe agent toolkit'] },
  { name: 'PayPal', markers: ['paypal.com', 'paypalobjects.com', 'paypal.js', 'paypal agent toolkit'] },
  { name: 'Adyen', markers: ['adyen.com', 'adyen.js'] },
  { name: 'Braintree', markers: ['braintree', 'braintree-gateway', 'braintree-sdk'] },
  { name: 'Klarna', markers: ['klarna.com', 'klarnacdn.net'] },
  { name: 'Affirm', markers: ['affirm.com', 'cdn1.affirm.com'] },
  { name: 'Amazon Pay', markers: ['amazonpay.com', 'payments.amazon.com'] },
  { name: 'Google Pay', markers: ['google-pay', 'pay.google.com'] },
  { name: 'Apple Pay', markers: ['apple-pay', 'apple-developer.apple.com'] }
];

export const aiVectorMarkers = [
  { label: 'Chatbot / Virtual Assistant', markers: ['intercom', 'zendesk', 'drift', 'ada.support', 'chat', 'support', 'kustomer', 'gladly', 'helpscout'], key: 'chatbot' },
  { label: 'Semantic Search', markers: ['algolia', 'constructor.io', 'bloomreach', 'klevu', 'search', 'searchspring', 'unbxd', 'coveo'], key: 'semantic' },
  { label: 'AI Personalization', markers: ['dynamic-yield', 'nosto', 'richrelevance', 'recommend', 'segment', 'tealium', 'braze'], key: 'personalization' },
  { label: 'Agentic Ready (MCP/UCP)', markers: ['mcp', 'ucp', 'acp', '.well-known/', 'api/v1'], key: 'agentic' },
  { label: 'Agentic UI Components', markers: ['headless', 'react-instantsearch', 'vue-instantsearch', 'algolia-search', 'ai-layout'], key: 'agentic_ui' },
  { label: 'Generative Discovery', markers: ['perplexity', 'openai', 'anthropic', 'claude', 'gemini', 'googlebot-news'], key: 'generative_discovery' }
];
