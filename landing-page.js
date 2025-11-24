/**
 * HTML Landing Page for Shopify Loyalty App
 * Includes simulation tools for testing integration
 */
module.exports = { landingPage: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loyalteez x Shopify Integration</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .glass {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen text-slate-800">

  <div class="max-w-4xl mx-auto px-4 py-12">
    
    <!-- Header -->
    <header class="text-center mb-16">
      <div class="inline-flex items-center justify-center p-2 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
        <span class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold tracking-wide uppercase mr-2">Live Demo</span>
        <span class="text-slate-500 text-sm font-medium">Shopify Loyalty Integration</span>
      </div>
      <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Shopify <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Rewards Engine</span>
      </h1>
      <p class="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Production-ready webhook handler for distributing rewards on the Loyalteez platform.
      </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      <!-- Simulation Panel -->
      <div class="glass rounded-3xl p-8 shadow-xl border border-white/50 relative overflow-hidden">
        <div class="absolute top-0 right-0 bg-gradient-to-bl from-indigo-100 to-transparent w-32 h-32 rounded-bl-full opacity-50"></div>
        
        <div class="flex items-center gap-3 mb-6 relative z-10">
          <div class="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">Simulate Purchase</h2>
            <p class="text-sm text-slate-500">Trigger a reward event instantly</p>
          </div>
        </div>

        <form id="simForm" class="space-y-5 relative z-10">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Customer Email</label>
            <input type="email" id="email" required 
              class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-medium"
              placeholder="customer@example.com" value="test@example.com">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Shop Domain</label>
            <input type="text" id="domain" required 
              class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-medium"
              placeholder="your-store.myshopify.com" value="test-store.myshopify.com">
            <p class="text-xs text-slate-400 mt-1">Must match your configured Partner Settings</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Order Total ($)</label>
            <div class="relative">
              <span class="absolute left-4 top-3.5 text-slate-400 font-semibold">$</span>
              <input type="number" id="amount" required min="1" step="0.01"
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-medium"
                value="50.00">
            </div>
          </div>

          <button type="submit" id="submitBtn"
            class="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group">
            <span>Place Mock Order</span>
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </button>
        </form>

        <!-- Response Area -->
        <div id="result" class="mt-6 hidden">
          <div class="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
            <div class="flex items-center justify-between mb-2 border-b border-slate-700 pb-2">
              <span class="text-slate-400">Server Response</span>
              <span id="statusBadge" class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]">200 OK</span>
            </div>
            <pre id="jsonOutput" class="whitespace-pre-wrap break-all"></pre>
          </div>
        </div>
      </div>

      <!-- Info Panel -->
      <div class="space-y-6 py-4">
        <div class="flex items-start gap-4">
          <div class="p-2 bg-green-100 text-green-600 rounded-lg mt-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900">Automatic Rewards</h3>
            <p class="text-sm text-slate-600 mt-1">When an order is placed, the webhook triggers immediately. 10 LTZ are rewarded for every $1 spent.</p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="p-2 bg-blue-100 text-blue-600 rounded-lg mt-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900">Secure Verification</h3>
            <p class="text-sm text-slate-600 mt-1">This worker validates the HMAC signature from Shopify to ensure only real orders trigger rewards.</p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="p-2 bg-purple-100 text-purple-600 rounded-lg mt-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900">Instant Settlement</h3>
            <p class="text-sm text-slate-600 mt-1">Transactions are processed on the Loyalteez platform in real-time.</p>
          </div>
        </div>

        <div class="pt-8 mt-8 border-t border-slate-200">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Configuration</h4>
          <div class="bg-slate-100 rounded-lg p-4 font-mono text-xs text-slate-600 space-y-2">
            <div class="flex justify-between">
              <span>Webhook URL:</span>
              <span class="text-slate-900 select-all">/webhooks/shopify</span>
            </div>
            <div class="flex justify-between">
              <span>API Version:</span>
              <span class="text-slate-900">2025-10</span>
            </div>
            <div class="flex justify-between">
              <span>Environment:</span>
              <span class="text-green-600 font-bold">Production</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('simForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const result = document.getElementById('result');
      const output = document.getElementById('jsonOutput');
      const badge = document.getElementById('statusBadge');
      
      // Loading state
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-pulse">Processing...</span>';
      result.classList.add('hidden');

      try {
        const email = document.getElementById('email').value;
        const amount = document.getElementById('amount').value;
        const domain = document.getElementById('domain').value;

        const response = await fetch('/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, amount, domain })
        });

        const data = await response.json();
        
        result.classList.remove('hidden');
        output.textContent = JSON.stringify(data, null, 2);
        
        if (response.ok) {
          badge.textContent = 'Success';
          badge.className = 'px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]';
        } else {
          badge.textContent = 'Error';
          badge.className = 'px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px]';
        }

      } catch (err) {
        result.classList.remove('hidden');
        output.textContent = 'Network Error: ' + err.message;
        badge.textContent = 'Failed';
        badge.className = 'px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px]';
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  </script>
</body>
</html>
` };

