import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Privacy = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-[#f8fafc] text-black' : 'bg-[#0a0a0f] text-white'} flex flex-col`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-grow flex flex-col items-center p-6 sm:p-12 relative overflow-hidden font-syne">
        <div className="z-10 max-w-4xl w-full space-y-6 p-8 md:p-12 rounded-3xl text-left" style={{
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: theme === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: theme === 'light' ? '0 20px 40px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#3BA8D8] to-[#7c3aed] mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className={`text-base md:text-lg leading-relaxed space-y-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} font-sans`}>
            <p className="font-semibold">Last Updated: June 17, 2026</p>
            
            <p>Skriibe ("Skriibe", "we", "our", or "us") is operated by Edlern Innovations Private Limited. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or use our website and services.</p>
            <p>By using Skriibe, you agree to the collection and use of information in accordance with this Privacy Policy.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>1. Information We Collect</h2>
            <p>We may collect the following information when you use Skriibe:</p>
            <p className="font-semibold mt-4">Information You Provide</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Mobile phone number</li>
              <li>Account registration details</li>
              <li>Information submitted through forms, waitlists, surveys, or support requests</li>
            </ul>
            <p className="font-semibold mt-4">Payment Information</p>
            <p>If you make purchases through Skriibe, payments are processed by trusted third-party payment providers. We do not store your complete payment card details on our servers.</p>
            <p className="font-semibold mt-4">Automatically Collected Information</p>
            <p>When you access our website, we may automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Website usage data</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage user accounts</li>
              <li>Operate and improve the Skriibe platform</li>
              <li>Manage waitlists and early access programs</li>
              <li>Process payments and transactions</li>
              <li>Provide customer support</li>
              <li>Send service-related notifications and updates</li>
              <li>Detect fraud, abuse, and security issues</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3. Future Platform Integrations</h2>
            <p>Skriibe may introduce integrations with third-party services, including social media and messaging platforms, in future versions of the Service.</p>
            <p>If such integrations become available, we will update this Privacy Policy to clearly explain:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>What information is collected</li>
              <li>How it is used</li>
              <li>Your rights and choices regarding that information</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4. Sharing of Information</h2>
            <p>We do not sell or rent your personal information.</p>
            <p>We may share information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment processing providers</li>
              <li>Cloud hosting and infrastructure providers</li>
              <li>Analytics and performance monitoring services</li>
              <li>Government authorities when required by law</li>
            </ul>
            <p>All third-party service providers are required to protect your information and use it only for authorized purposes.</p>
            <p>By submitting message content, users acknowledge and consent to the processing and temporary storage of such content solely for platform operation, moderation, dispute resolution, fraud prevention, and legal compliance.</p>
            <p>Skriibe discloses user information only pursuant to valid legal requests, court orders, statutory obligations, emergency harm prevention requirements, or lawful governmental directives.</p>
            <p>Some of our service providers (for example, cloud hosting or analytics providers) may process or store personal information outside India. Where this occurs, Skriibe takes reasonable contractual and technical measures designed to protect that information, and does not transfer personal information to any country that the Central Government has restricted under the Digital Personal Data Protection Act, 2023.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5. Data Retention</h2>
            <p>We retain personal information only for as long as necessary to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide our services</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce agreements</li>
            </ul>
            <p>You may request deletion of your account and personal information by contacting us. Retention periods are determined based on legal necessity, fraud prevention, dispute resolution requirements, and operational necessity.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>6. Your Rights</h2>
            <p>Subject to applicable laws, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Withdraw consent where applicable</li>
              <li>Request information about how your data is processed</li>
            </ul>
            <p>To exercise these rights, contact us using the details below. We will acknowledge grievances within 24 hours and aim to resolve them within 15 days, consistent with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and you may also approach the Data Protection Board of India in accordance with the Digital Personal Data Protection Act, 2023.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>7. Cookies and Tracking Technologies</h2>
            <p>Skriibe may use cookies and similar tracking technologies to maintain your session and improve your experience. You can disable cookies in your browser settings, though some features of Skriibe may not function properly without them.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8. Security</h2>
            <p>We implement reasonable technical, administrative, and organizational measures to protect your information from unauthorized access, disclosure, alteration, or destruction.</p>
            <p>However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security. Skriibe implements reasonable security safeguards consistent with Rule 8 of the SPDI Rules, 2011 and the reasonable security safeguards required under the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025, including access controls, encryption where appropriate, and logging of personal data processing activity. In the event of a personal data breach, Skriibe will notify the Data Protection Board of India and affected users as required under applicable law.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>9. Children's Privacy</h2>
            <p>Skriibe is not intended for users under the age of 18, consistent with the eligibility requirement in our Terms of Service. Under the Digital Personal Data Protection Act, 2023, a "child" means anyone under 18, and we do not knowingly collect personal information from anyone under 18. If we become aware that a child has created an account or provided personal information to us, we will take steps to delete the account and associated information, or to verify consent from a parent or lawful guardian where applicable. If you believe we have inadvertently collected such information, please contact us immediately.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>10. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time.</p>
            <p>We will notify you of any significant changes by posting the new policy on this page with an updated date. Continued use of Skriibe after changes constitutes acceptance of the updated policy.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>11. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
            <p><strong>Edlern Innovations Private Limited</strong></p>
            <p>Grievance Officer: Tarundeep Singh, Founder</p>
            <p>Sector 27 D, Chandigarh – 160019, India</p>
            <p>Email: <a href="mailto:founder@skriibe.com" className="text-[#3BA8D8] hover:underline">founder@skriibe.com</a></p>
            <p>Website: <a href="https://skriibe.com" className="text-[#3BA8D8] hover:underline">https://skriibe.com</a></p>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Privacy;
