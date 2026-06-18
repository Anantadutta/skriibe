import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Guidelines = () => {
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
            Skriibe Community Guidelines
          </h1>
          
          <div className={`text-base md:text-lg leading-relaxed space-y-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} font-sans`}>
            <p className="font-semibold">Last Updated: June 2026</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Welcome to Skriibe</h2>
            <p>Skriibe is a platform where fans can submit paid questions to creators, experts, educators, coaches, professionals, and community leaders through AMA (Ask Me Anything), and receive a response within 24 hours or a full refund.</p>
            <p>To maintain a safe, respectful, and valuable experience for everyone, all users must follow these Community Guidelines.</p>
            <p>Failure to comply may result in content removal, refunds being denied, account restrictions, suspension, payout holds, or permanent account termination.</p>
            <p>Creators must not have any material criminal convictions, pending criminal proceedings, or ongoing investigations relating to fraud, financial misconduct, cybercrime, sexual offences, child safety violations, human trafficking, terrorism, money laundering, violent offences, or other serious criminal activities that may pose a risk to users, creators, or the Skriibe platform.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>1. Be Respectful</h2>
            <p>Treat all users with respect and professionalism.</p>
            <p>Do not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harass, threaten, intimidate, or bully others.</li>
              <li>Use abusive, hateful, or discriminatory language.</li>
              <li>Engage in personal attacks.</li>
              <li>Encourage others to target or harass users.</li>
            </ul>
            <p>Healthy disagreement is allowed. Abuse is not.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2. Ask Genuine Questions</h2>
            <p>Questions should be clear, relevant, and submitted in good faith.</p>
            <p>Do not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submit spam or repetitive questions.</li>
              <li>Submit meaningless or intentionally confusing questions.</li>
              <li>Use automated tools to generate large volumes of questions.</li>
              <li>Attempt to manipulate creators or platform systems.</li>
            </ul>
            <p>Creators may reject questions that are vague, misleading, or impossible to answer.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3. No Illegal Activities</h2>
            <p>You may not use Skriibe to request, promote, facilitate, or encourage illegal activities.</p>
            <p>This includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fraud or scams.</li>
              <li>Financial crimes.</li>
              <li>Hacking or unauthorized access.</li>
              <li>Drug-related crimes.</li>
              <li>Violence or criminal activity.</li>
              <li>Copyright infringement.</li>
              <li>Identity theft.</li>
            </ul>
            <p>Content involving illegal activity may be reported to relevant authorities when required by law.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4. No Harassment or Abuse</h2>
            <p>Users may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Send threatening messages.</li>
              <li>Use sexually explicit harassment.</li>
              <li>Make unwanted advances.</li>
              <li>Target users based on race, religion, nationality, gender, disability, or other protected characteristics.</li>
            </ul>
            <p>Creators have the right to reject abusive questions without refund. Users who feel harassed or threatened by a creator's response must report immediately to support@skriibe.com. Skriibe will respond within <strong>48 hours</strong>.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5. No Hate Speech</h2>
            <p>Content that promotes hatred, violence, or discrimination against individuals or groups is prohibited.</p>
            <p>This includes attacks based on:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Race</li>
              <li>Ethnicity</li>
              <li>Religion</li>
              <li>Nationality</li>
              <li>Gender</li>
              <li>Sexual orientation</li>
              <li>Disability</li>
              <li>Age</li>
            </ul>
            <p>Such content may result in immediate account action.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>6. No Fraud or Payment Abuse</h2>
            <p>Users may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use stolen payment methods.</li>
              <li>Create fake accounts.</li>
              <li>Abuse refund requests.</li>
              <li>File fraudulent chargebacks.</li>
              <li>Manipulate platform payouts.</li>
              <li>Circumvent platform fees.</li>
            </ul>
            <p>Fraudulent activity may result in permanent account termination.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>7. Respect Creator Boundaries</h2>
            <p>Creators choose which questions they answer.</p>
            <p>Creators may reject questions that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fall outside their expertise.</li>
              <li>Are inappropriate.</li>
              <li>Are unclear or incomplete.</li>
              <li>Violate platform policies.</li>
            </ul>
            <p>Fans must respect these decisions.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8. No Impersonation</h2>
            <p>Do not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pretend to be another person.</li>
              <li>Misrepresent your identity.</li>
              <li>Use misleading profile information.</li>
              <li>Claim credentials you do not possess.</li>
            </ul>
            <p>Verified creators found impersonating others may be permanently removed.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>9. Intellectual Property</h2>
            <p>Only submit content that you own or have the right to use.</p>
            <p>Do not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload copyrighted material without permission.</li>
              <li>Copy creator responses and resell them.</li>
              <li>Reproduce platform content without authorization.</li>
            </ul>
            <p>Creators retain ownership of their responses and original content.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>10. Professional Advice Disclaimer</h2>
            <p>Questions relating to health, law, finance, investments, taxes, mental health, or other regulated fields should not be considered professional advice unless explicitly stated by the creator.</p>
            <p>Users remain responsible for their own decisions and actions.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>11. Reporting Violations</h2>
            <p>Users can report:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harassment</li>
              <li>Abuse</li>
              <li>Fraud</li>
              <li>Impersonation</li>
              <li>Policy violations</li>
              <li>Illegal content</li>
            </ul>
            <p>Reports will be reviewed by the Skriibe team.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>12. Prohibited Content</h2>
            <p>The following content is <strong>absolutely prohibited</strong> on Skriibe:</p>
            <p>12.1 Sexually explicit, pornographic, or adult content of any nature.</p>
            <p>12.2 Content that glorifies, promotes, depicts, or facilitates violence or self-harm.</p>
            <p>12.3 Content promoting, financing, or inciting terrorism, extremism, or organized criminal activity.</p>
            <p>12.4 <strong>Child Sexual Abuse Material (CSAM):</strong> Zero tolerance. Any detected CSAM will be immediately removed, the account permanently banned, and the matter reported to the <strong>National Cybercrime Reporting Portal (cybercrime.gov.in)</strong> and <strong>CERT-In</strong>, as required under the IT Act, 2000 and the <strong>Protection of Children from Sexual Offences Act, 2012 (POCSO)</strong>. Skriibe will fully cooperate with law enforcement in any related investigation.</p>
            <p>12.5 Content that promotes or normalizes casteism, communalism, religious hate, or discrimination on any protected basis.</p>
            <p>12.6 Content related to illegal gambling, controlled substance trafficking, or unlicensed weapons.</p>
            <p>12.7 Content that infringes any third-party intellectual property rights, including unauthorized use of music, film, brand logos, or copyrighted material.</p>
            <p>12.8 Skriibe reserves the right to remove any content that, in its judgment, violates the spirit or intent of these Guidelines even if not explicitly enumerated above.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>13. Scam Prevention</h2>
            <p>13.1 The following constitute <strong>scam behavior</strong> and are strictly prohibited:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Creators promising outcomes, results, or deliverables they have no intent or ability to fulfill.</li>
              <li>Users submitting messages designed to extract personal or financial information from creators.</li>
              <li>Impersonating verified creators, public figures, or Platform staff.</li>
              <li>Creating or operating fake accounts to generate false popularity, reviews, or revenue.</li>
              <li>Coordinating with third parties to manipulate creator rankings or platform visibility.</li>
            </ul>
            <p>13.2 Skriibe employs automated scam detection. Suspicious accounts are flagged for immediate manual review and may be suspended pending investigation.</p>
            <p>13.3 To report a suspected scam: <strong>founder@skriibe.com</strong></p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>14. User Safety</h2>
            <p>14.1 Skriibe facilitates <strong>digital-only interactions</strong>. No in-person meetings, physical arrangements, offline exchanges, or personal introductions are facilitated through the Platform. Any creator or user attempting to arrange such interactions through Skriibe communications is in breach of these Guidelines.</p>
            <p>14.2 Do not voluntarily share your personal contact information — phone number, home or work address, or social media handles — in paid messages. Skriibe is not responsible for harm arising from voluntary off-platform communication.</p>
            <p>14.3 If a creator's response makes you feel unsafe or threatened, do not engage further. Report immediately to support@skriibe.com and, if warranted, to your local police or the National Cybercrime Portal (cybercrime.gov.in).</p>
            <p>14.4 <strong>Professional Services Disclaimer:</strong> Creators who discuss topics in medicine, law, finance, or mental health are not providing licensed professional services unless their profile explicitly states verified credentials. Skriibe does not verify professional credentials and users should not treat creator responses as a substitute for licensed professional advice.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>15. Platform Moderation Rights</h2>
            <p>15.1 Skriibe reserves the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Monitor content for Community Guideline compliance at its discretion.</li>
              <li>Remove any content that violates these Guidelines without prior notice to the poster.</li>
              <li>Suspend or permanently ban accounts for single or repeated violations, based on severity.</li>
              <li>Cooperate fully with Indian law enforcement agencies in any investigation involving Platform activities.</li>
              <li>Disclose user or creator information to authorities when legally required or when there is reasonable belief of criminal activity.</li>
            </ul>
            <p>Skriibe may preserve electronic records, communications metadata, transaction logs, and related information for compliance, dispute resolution, fraud detection, cybersecurity monitoring, and legal proceedings.</p>
            <p>15.2 Skriibe is not obligated to proactively monitor all content and does not assume editorial responsibility for user or creator-generated content beyond its intermediary obligations under the IT Act, 2000 and IT Rules, 2021.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>16. Enforcement Actions for Creators</h2>
            <p>Skriibe may take any of the following actions for Creators. Strike timing windows, decay periods, and appeal procedures are set out in the Refund & Cancellation Policy's Creator Strike Policy.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Strike 1 – Guidelines Warning:</strong> Formal warning issued. Creator Health Score may be reduced.</li>
              <li><strong>Strike 2 – Admin Review:</strong> Account placed under review. Platform visibility may be limited pending review.</li>
              <li><strong>Strike 3 – Temporary Suspension:</strong> Account temporarily suspended. Certain platform features may be restricted.</li>
              <li><strong>Strike 4 – Permanent Removal:</strong> Account permanently removed from Skriibe.</li>
            </ul>
            <p>Skriibe reserves the right to bypass the strike system and immediately suspend or terminate accounts involved in:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fraud</li>
              <li>Payment abuse</li>
              <li>Impersonation</li>
              <li>Illegal activities</li>
              <li>Serious harassment</li>
              <li>Threats of violence</li>
              <li>Platform security risks</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>17. Enforcement Actions for Fans</h2>
            <p>Skriibe may take any of the following actions for Fans:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Strike 1 – Guidelines Warning:</strong> Formal warning issued for violating Community Guidelines.</li>
              <li><strong>Strike 2 – Temporary Suspension:</strong> Account temporarily suspended for 7 days. The Fan may be restricted from submitting new questions during the suspension period.</li>
              <li><strong>Strike 3 – Permanent Removal:</strong> Account permanently removed from Skriibe.</li>
            </ul>
            <p>Skriibe reserves the right to bypass the strike system and immediately suspend or terminate accounts involved in:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fraud</li>
              <li>Payment abuse</li>
              <li>Chargeback abuse</li>
              <li>Impersonation</li>
              <li>Illegal activities</li>
              <li>Serious harassment</li>
              <li>Hate speech</li>
              <li>Threats of violence</li>
              <li>Spam or platform abuse</li>
              <li>Platform security risks</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18. Changes to These Guidelines</h2>
            <p>Skriibe may update these Community Guidelines from time to time.</p>
            <p>Continued use of the platform constitutes acceptance of the latest version.</p>
            
            <p className="italic mt-8 text-center text-[#3BA8D8] font-medium">Skriibe is committed to building a platform where creators thrive and users feel genuinely safe and valued. These Guidelines will be updated as the platform evolves. Thank you for being part of the Skriibe community.</p>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Guidelines;
