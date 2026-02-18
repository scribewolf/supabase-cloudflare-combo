import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const SUPABASE_URL = 'https://niaxdddzdskqkhhmcjal.supabase.co/'; // Replace with your URL from Step 1.3
const SUPABASE_ANON_KEY = 'sb_publishable_PFUrx8fJvFNKE9PctemDSg_T7g-V7WY'; // Replace with your anon key from Step 1.3

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = document.getElementById('app');
let isLoginMode = true; // Track if we're in login or signup mode

// Check if user is already logged in
async function checkAuthStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showSuccessPage(session.user.email);
    } else {
        showLoginForm();
    }
}

// Show login/signup form
function showLoginForm() {
    app.innerHTML = `
        <div class="container">
            <h1 id="form-title">Login</h1>
            <form id="auth-form">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" required placeholder="your@email.com">
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" required placeholder="Enter your password">
                </div>
                <button type="submit" id="auth-btn">Login</button>
                <div id="error-message" class="error"></div>
            </form>
            <div class="toggle-form">
                <span id="toggle-text">Don't have an account? </span>
                <a id="toggle-link">Sign Up</a>
            </div>
        </div>
    `;

    const form = document.getElementById('auth-form');
    const toggleLink = document.getElementById('toggle-link');
    const formTitle = document.getElementById('form-title');
    const authBtn = document.getElementById('auth-btn');
    const toggleText = document.getElementById('toggle-text');

    toggleLink.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        formTitle.textContent = isLoginMode ? 'Login' : 'Sign Up';
        authBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
        toggleText.textContent = isLoginMode ? "Don't have an account? " : 'Already have an account? ';
        toggleLink.textContent = isLoginMode ? 'Sign Up' : 'Login';
        document.getElementById('error-message').textContent = '';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');

        authBtn.disabled = true;
        authBtn.textContent = 'Loading...';

        try {
            if (isLoginMode) {
                // Login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                console.log('Login successful:', data);
                showSuccessPage(email);
            } else {
                // Sign up
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                console.log('Signup successful:', data);
                errorDiv.style.color = '#27ae60';
                errorDiv.textContent = 'Account created! Check your email to confirm, then login.';
                form.reset();
            }
        } catch (error) {
            errorDiv.textContent = error.message || 'An error occurred';
            authBtn.disabled = false;
            authBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
        }
    });
}

// Show success page
function showSuccessPage(userEmail) {
    app.innerHTML = `
        <div class="container success-page">
            <h1>✓ Well Done!</h1>
            <p>You have successfully logged in</p>
            <p style="color: #888; font-size: 14px;">Logged in as: <strong>${userEmail}</strong></p>
            <button class="logout-btn" id="logout-btn">Logout</button>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        showLoginForm();
    });
}

// Initialize app
checkAuthStatus();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        showSuccessPage(session.user.email);
    } else {
        showLoginForm();
    }
});