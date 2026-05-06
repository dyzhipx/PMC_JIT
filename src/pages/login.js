export const LoginPage = (() => {
  function render() {
    const appContainer = document.getElementById('app');
    
    const container = document.getElementById('page-content');
    
    // Hide sidebar and topbar explicitly for login page
    const sidebar = document.getElementById('sidebar');
    const topbar = document.getElementById('topbar');
    const main = document.getElementById('main');
    
    if (sidebar) sidebar.style.display = 'none';
    if (topbar) topbar.style.display = 'none';
    if (main) {
      main.style.marginLeft = '0';
      main.style.paddingTop = '0';
    }

    container.innerHTML = `
      <div class="login-page-container">
        <!-- Floating Animated Background Orbs -->
        <div class="login-bg-orb orb-1"></div>
        <div class="login-bg-orb orb-2"></div>
        <div class="login-bg-orb orb-3"></div>

        <!-- Glassmorphism Card -->
        <div class="login-glass-card">
          
          <!-- Left: Animated Character Illustration (Lottie) -->
          <div class="login-illustration">
            <div class="login-lottie-container" style="display: flex; align-items: center; justify-content: center; margin: 0 auto;">
              <!-- Interactive Pure SVG 3D Robot -->
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" id="login-robot" style="width: 100%; height: 100%; max-width: 250px; filter: drop-shadow(0 20px 25px rgba(0,0,0,0.5)); display: block; margin: auto;">
                <defs>
                  <!-- 3D Gradients -->
                  <linearGradient id="body3D" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38bdf8" />
                    <stop offset="50%" stop-color="#0284c7" />
                    <stop offset="100%" stop-color="#0c4a6e" />
                  </linearGradient>
                  <linearGradient id="glassFace" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b" />
                    <stop offset="100%" stop-color="#020617" />
                  </linearGradient>
                  <linearGradient id="hand3D" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#e0f2fe" />
                    <stop offset="100%" stop-color="#38bdf8" />
                  </linearGradient>
                  <!-- Shadows -->
                  <filter id="innerShadow">
                    <feOffset dx="0" dy="4"/>
                    <feGaussianBlur stdDeviation="5" result="offset-blur"/>
                    <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                    <feFlood flood-color="black" flood-opacity="0.7" result="color"/>
                    <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
                    <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
                  </filter>
                </defs>

                <!-- Antennas -->
                <line x1="50" y1="80" x2="30" y2="60" stroke="#bae6fd" stroke-width="8" stroke-linecap="round"/>
                <line x1="150" y1="80" x2="170" y2="60" stroke="#bae6fd" stroke-width="8" stroke-linecap="round"/>
                <circle cx="30" cy="60" r="12" fill="#e0f2fe">
                  <animate attributeName="r" values="12;15;12" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="170" cy="60" r="12" fill="#e0f2fe">
                  <animate attributeName="r" values="12;15;12" dur="1.5s" repeatCount="indefinite" delay="0.7s" />
                </circle>
                
                <!-- Main 3D Body -->
                <rect x="30" y="50" width="140" height="130" rx="40" fill="url(#body3D)" filter="url(#innerShadow)"/>
                
                <!-- Face Screen (Glassmorphism look) -->
                <rect x="50" y="70" width="100" height="65" rx="15" fill="url(#glassFace)" stroke="#0ea5e9" stroke-width="3"/>
                
                <!-- Eyes Group (Tracking) -->
                <g id="robot-eyes" style="transform: translate(0px, 0px); transition: transform 0.1s ease-out;">
                  <!-- Left Eye -->
                  <ellipse cx="75" cy="100" rx="10" ry="14" fill="#38bdf8">
                    <animate attributeName="ry" values="14;2;14;14;14;14" dur="4s" repeatCount="indefinite" />
                  </ellipse>
                  <circle cx="78" cy="96" r="3" fill="#ffffff" opacity="0.8"/>
                  
                  <!-- Right Eye -->
                  <ellipse cx="125" cy="100" rx="10" ry="14" fill="#38bdf8">
                    <animate attributeName="ry" values="14;2;14;14;14;14" dur="4s" repeatCount="indefinite" />
                  </ellipse>
                  <circle cx="128" cy="96" r="3" fill="#ffffff" opacity="0.8"/>
                </g>
                
                <!-- Blushing Cheeks -->
                <circle cx="60" cy="115" r="8" fill="#ec4899" opacity="0.4" filter="blur(2px)"/>
                <circle cx="140" cy="115" r="8" fill="#ec4899" opacity="0.4" filter="blur(2px)"/>

                <!-- Mouth -->
                <path d="M 85 145 Q 100 155 115 145" fill="none" stroke="#e0f2fe" stroke-width="5" stroke-linecap="round" id="robot-mouth" style="transition: all 0.3s;" />

                <!-- 3D Hands (Moves up to cover eyes) -->
                <g id="robot-hands" style="transform: translateY(50px); transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);">
                  <!-- Left Hand -->
                  <rect x="55" y="150" width="40" height="50" rx="20" fill="url(#hand3D)" filter="url(#innerShadow)"/>
                  <!-- Right Hand -->
                  <rect x="105" y="150" width="40" height="50" rx="20" fill="url(#hand3D)" filter="url(#innerShadow)"/>
                </g>
              </svg>
            </div>
            <h2>Sistem PMC</h2>
            <p>Packaging Material Calculator<br>JIT & Inventory Management</p>
          </div>

          <!-- Right: Login Form -->
          <div class="login-form-section">
            <h1>Wilujeng Sumping</h1>
            <p class="subtitle">Mangga lebetkeun email sareng sandi anjeun kanggo lajengkeun</p>
            
            <div id="login-error" style="display:none; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#ff6b6b; padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:13px; text-align:center; animation: shake 0.4s ease-in-out;"></div>
            
            <form id="loginForm">
              <div class="login-input-group">
                <input type="email" id="login-email" placeholder=" " required autocomplete="email" />
                <label for="login-email">Email</label>
              </div>
              
              <div class="login-input-group">
                <input type="password" id="login-password" placeholder=" " required />
                <label for="login-password">Password</label>
              </div>
              
              <button type="submit" class="btn-animated-login" id="login-submit-btn">
                <span>Lebet (Sign In)</span>
              </button>
            </form>

            <div style="margin-top:20px; text-align:center; font-size:11px; color:rgba(255,255,255,0.3);">
              PMC JIT System v2.0 — PT. Santos Jaya Abadi
            </div>
          </div>

        </div>
      </div>
      <style>
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      </style>
    `;

    bindEvents();
    setupRobotInteractions();
  }

  function bindEvents() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('login-submit-btn');
      const errorDiv = document.getElementById('login-error');
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Disable button & show loading
      btn.innerHTML = '<span>Nuju Lebet...</span>';
      btn.style.opacity = '0.7';
      btn.disabled = true;
      errorDiv.style.display = 'none';

      try {
        // Real authentication via Better Auth
        await window.Auth.login(email, password);

        // Success — restore layout and navigate
        const sidebar = document.getElementById('sidebar');
        const topbar = document.getElementById('topbar');
        const main = document.getElementById('main');
        
        if (sidebar) sidebar.style.display = '';
        if (topbar) topbar.style.display = '';
        if (main) {
          main.style.marginLeft = '';
          main.style.paddingTop = '';
        }

        // Navigate to role-appropriate default page
        const defaultRoute = window.Auth.getDefaultRoute();
        window.location.hash = defaultRoute.replace('#', '');

      } catch (err) {
        // Show error message
        errorDiv.textContent = '❌ ' + (err.message || 'Login gagal. Periksa email dan password Anda.');
        errorDiv.style.display = 'block';
        
        // Reset button
        btn.innerHTML = '<span>Lebet (Sign In)</span>';
        btn.style.opacity = '1';
        btn.disabled = false;

        // Shake the robot mouth to show surprise
        const mouth = document.getElementById('robot-mouth');
        if (mouth) {
          mouth.setAttribute('d', 'M 90 150 Q 100 145 110 150');
          setTimeout(() => mouth.setAttribute('d', 'M 85 145 Q 100 155 115 145'), 1500);
        }
      }
    });
  }

  function setupRobotInteractions() {
    const eyes = document.getElementById('robot-eyes');
    const hands = document.getElementById('robot-hands');
    const mouth = document.getElementById('robot-mouth');
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    if (emailInput && eyes) {
      emailInput.addEventListener('focus', () => {
        hands.style.transform = 'translateY(50px)'; // Hands down
        mouth.setAttribute('d', 'M 85 145 Q 100 155 115 145'); // Smile
      });
      
      emailInput.addEventListener('input', (e) => {
        const len = e.target.value.length;
        const boundedLen = Math.min(len, 25);
        // Move eyes horizontally (-12px to +12px)
        const moveX = -12 + (boundedLen / 25) * 24;
        const moveY = 4; // Look slightly down at input
        eyes.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
      
      emailInput.addEventListener('blur', () => {
        eyes.style.transform = `translate(0px, 0px)`; // Look forward
      });
    }

    if (passwordInput && hands) {
      passwordInput.addEventListener('focus', () => {
        // Move hands UP to cover eyes
        hands.style.transform = 'translateY(-70px)';
        eyes.style.transform = `translate(0px, -5px)`; // Eyes look up in shock
        mouth.setAttribute('d', 'M 90 150 Q 100 145 110 150'); // "O" mouth or worried
      });
      
      passwordInput.addEventListener('blur', () => {
        // Move hands DOWN
        hands.style.transform = 'translateY(50px)';
        eyes.style.transform = `translate(0px, 0px)`;
        mouth.setAttribute('d', 'M 85 145 Q 100 155 115 145'); // Smile
      });
    }
  }

  return { render };
})();

// Assign to global if needed
window.LoginPage = LoginPage;
