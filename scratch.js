const fs = require('fs');

const signupCode = fs.readFileSync('frontend/src/pages/creator/CreatorSignup.jsx', 'utf8');

let authCode = signupCode;
authCode = authCode.replace('const CreatorSignup = () => {', 'const CreatorAuth = ({ initialMode = "signup" }) => {');
authCode = authCode.replace('export default CreatorSignup;', 'export default CreatorAuth;');
authCode = authCode.replace("import { emailSignup } from '../../services/creatorApi';", "import { emailSignup, emailLogin } from '../../services/creatorApi';");

// Insert isLogin state
authCode = authCode.replace("const [email, setEmail] = useState('');", "const [isLogin, setIsLogin] = useState(initialMode === 'login');\n  const [email, setEmail] = useState('');");

// Replace handleRegister with handleSubmit
const registerBlock = `  const handleRegister = async () => {`;
const submitBlock = `  const handleSubmit = async () => {
    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      
      localStorage.removeItem('bankLinked');
      setLoading(true);
      setError('');
      try {
        const res = await emailLogin(email, password);
        const { creator, token } = res.data;
        
        localStorage.setItem('isReturningCreator', 'true');
        
        if (token) {
          setAuthData(['creator'], 'creator', token);
        }
        
        if (creator.handle) {
          navigate('/creator/dashboard', { state: { creator }, replace: true });
        } else {
          navigate('/onboard/profile', { state: { creator }, replace: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Try again.');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Original handleRegister logic below
`;
authCode = authCode.replace(registerBlock, submitBlock);

// Remove the `isInvalid` logic that requires confirmPassword for login
authCode = authCode.replace(
  "const isInvalid = !email || !password || !confirmPassword || password !== confirmPassword || !checkPasswordStrength(password);",
  "const isInvalid = isLogin ? (!email || !password) : (!email || !password || !confirmPassword || password !== confirmPassword || !checkPasswordStrength(password));"
);

// Switch the title
authCode = authCode.replace(
  "Join the platform. Get paid to reply.",
  "{isLogin ? 'Welcome back. Log in to your account.' : 'Join the platform. Get paid to reply.'}"
);

// Conditionally render "CONFIRM PASSWORD" block
const confirmPassBlock = `              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: '#06b6d4',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
                letterSpacing: '1.5px',
                fontWeight: '600'
              }}>
                CONFIRM PASSWORD
              </label>`;
authCode = authCode.replace(confirmPassBlock, `              {!isLogin && (<>\n${confirmPassBlock}`);

const confirmPassEnd = `              {password && confirmPassword && password !== confirmPassword && (
                <div style={{ color: '#ef4444', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '16px', marginTop: '-8px' }}>
                  Passwords do not match
                </div>
              )}`;
authCode = authCode.replace(confirmPassEnd, `${confirmPassEnd}\n              </>)}`);

// Conditionally render password strength
const pwdStrengthBlock = `              {password && !checkPasswordStrength(password) && (
                <div style={{ color: '#ef4444', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '16px', marginTop: '-8px' }}>
                  Must be at least 8 chars with 1 number/special char.
                </div>
              )}`;
authCode = authCode.replace(pwdStrengthBlock, `              {!isLogin && password && !checkPasswordStrength(password) && (
                <div style={{ color: '#ef4444', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '16px', marginTop: '-8px' }}>
                  Must be at least 8 chars with 1 number/special char.
                </div>
              )}`);

// Conditionally render Forgot Password
const errorBlock = `              {error && (`;
authCode = authCode.replace(errorBlock, `              {isLogin && (
                <div style={{ textAlign: 'right', marginTop: '12px', paddingRight: '4px' }}>
                  <Link to="/creator/forgot-password" style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                    Forgot Password?
                  </Link>
                </div>
              )}

              {error && (`);

// Fix button text and click handler
authCode = authCode.replace(
  `onClick={handleRegister}`,
  `onClick={handleSubmit}`
);
authCode = authCode.replace(
  `{loading ? 'Registering...' : 'Register →'}`,
  `{loading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Login →' : 'Register →')}`
);

// Fix toggle link
const loginLinkBlock = `              {/* LINK TO LOGIN */}
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>Already have an account? </span>
                <Link to="/creator/login" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: '600' }}>Log in here</Link>
              </div>`;
              
authCode = authCode.replace(loginLinkBlock, `              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
                <span 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }} 
                  style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isLogin ? "Register here" : "Log in here"}
                </span>
              </div>`);

fs.writeFileSync('frontend/src/pages/creator/CreatorAuth.jsx', authCode);
console.log('CreatorAuth.jsx generated successfully.');
