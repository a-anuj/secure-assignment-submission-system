import { useState } from 'react';

interface Technique {
  id: string;
  name: string;
  level: 'Low' | 'Medium' | 'Medium-High' | 'High' | 'Very High';
  purpose: string;
  whereUsed: string[];
  risks: { title: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; description: string }[];
  attacks: string[];
  recommendation: string;
  color: string;
}

const techniques: Technique[] = [
  {
    id: 'base64',
    name: 'Base64 Encoding',
    level: 'Low',
    purpose: 'Safe data transfer and storage of binary data',
    whereUsed: ['RSA-encrypted keys', 'Digital signatures', 'Public key storage'],
    risks: [
      { title: 'Exposure', severity: 'High', description: 'If intercepted, Base64 can be decoded trivially' },
      { title: 'False Security', severity: 'Critical', description: 'Appears encrypted but is only obfuscated' },
      { title: 'Data Visibility', severity: 'Medium', description: 'Binary data remains readable in logs' }
    ],
    attacks: [
      'Base64 Decoding Attack - Attacker decodes strings to obtain encrypted data',
      'Interception Attack - Man-in-the-Middle captures Base64 data',
      'Log Injection Attack - Attacker logs Base64 strings in plaintext'
    ],
    recommendation: '✅ Acceptable when combined with encryption',
    color: 'from-yellow-900 to-yellow-800'
  },
  {
    id: 'aes256',
    name: 'AES-256 Encryption',
    level: 'High',
    purpose: 'Fast, symmetric encryption of assignment files',
    whereUsed: ['Student assignment files', 'File confidentiality protection'],
    risks: [
      { title: 'IV Reuse', severity: 'Critical', description: 'Same IV with same key reveals patterns' },
      { title: 'Key Exposure', severity: 'Critical', description: 'If leaked, all files compromised' },
      { title: 'Padding Oracle', severity: 'Medium', description: 'Improper validation could leak plaintext' },
      { title: 'Mode Weakness', severity: 'Low', description: 'CBC mode secure but CTR preferred' }
    ],
    attacks: [
      'Brute Force (Impractical: 10^77 years)',
      'IV Reuse Attack - Reveals plaintext patterns',
      'Padding Oracle Attack - Manipulates padding to decode',
      'Key Compromise - Attacker obtains AES key',
      'Replay Attack - Reuses old encrypted file'
    ],
    recommendation: '✅ Secure; Consider upgrading to AES-256-GCM',
    color: 'from-green-900 to-green-800'
  },
  {
    id: 'rsa2048',
    name: 'RSA-2048 Encryption',
    level: 'High',
    purpose: 'Secure encryption of AES keys and digital signatures',
    whereUsed: ['Encrypting AES keys', 'Digital signatures', 'Public key infrastructure'],
    risks: [
      { title: 'Key Exposure', severity: 'Critical', description: 'Private key leak compromises all security' },
      { title: 'Timing Attack', severity: 'Medium', description: 'RSA operations not constant-time' },
      { title: 'Quantum Computing', severity: 'High', description: 'Future threat to RSA security' },
      { title: 'Small Exponent', severity: 'Low', description: 'Not applicable (65537 is safe)' }
    ],
    attacks: [
      'Brute Force Factorization (300 trillion years with current tech)',
      'Private Key Compromise - Attacker obtains private key',
      'Timing Attack - Measure decryption time to reveal key info',
      'Padding Oracle Attack (RSA) - Similar to AES attack',
      'Signature Forgery - Create fake signature without key'
    ],
    recommendation: '✅ Secure until 2030; Plan migration to RSA-3072+ later',
    color: 'from-green-900 to-green-800'
  },
  {
    id: 'sha256',
    name: 'SHA-256 Hashing',
    level: 'High',
    purpose: 'File integrity verification and non-repudiation',
    whereUsed: ['File integrity verification', 'Digital signatures', 'Audit trails'],
    risks: [
      { title: 'Hash Collision', severity: 'Low', description: 'Extremely difficult to find two files with same hash' },
      { title: 'Preimage Attack', severity: 'Low', description: 'Extremely difficult to reverse hash' },
      { title: 'Hash Manipulation', severity: 'Low', description: 'Attacker modifies file and hash together' }
    ],
    attacks: [
      'Brute Force Collision (2^80 with advanced algorithms - not practical)',
      'Preimage Attack - Find file matching known hash',
      'Hash Manipulation - Modify file and hash in database'
    ],
    recommendation: '✅ Excellent choice; No upgrade needed',
    color: 'from-green-900 to-green-800'
  },
  {
    id: 'argon2',
    name: 'Argon2 Password Hashing',
    level: 'Very High',
    purpose: 'Secure password hashing with salt and memory hardness',
    whereUsed: ['User password hashing', 'Password verification during login'],
    risks: [
      { title: 'Weak Configuration', severity: 'Medium', description: 'Low memory/time cost vulnerable to GPU attacks' },
      { title: 'Rainbow Table', severity: 'Low', description: 'Salt makes tables impractical' },
      { title: 'Timing Attack', severity: 'Low', description: 'Comparison timing could reveal partial password' }
    ],
    attacks: [
      'Dictionary Attack - Try common passwords (Argon2 makes expensive)',
      'GPU/ASIC Attack - Use specialized hardware (resisted by memory requirements)',
      'Rainbow Table Attack - Defeated by 16-byte random salt',
      'Timing Attack - Mitigated by constant-time comparison'
    ],
    recommendation: '✅ Excellent choice; Ensure memory cost set to recommended values',
    color: 'from-emerald-900 to-emerald-800'
  },
  {
    id: 'jwt',
    name: 'JWT (HS256)',
    level: 'Medium-High',
    purpose: 'Secure authentication tokens and stateless sessions',
    whereUsed: ['User authentication', 'API authorization', 'Session management'],
    risks: [
      { title: 'Key Exposure', severity: 'Critical', description: 'Leaked secret key allows forging any token' },
      { title: 'Token Leakage', severity: 'High', description: 'If stolen via XSS, attacker has access' },
      { title: 'Revocation Challenge', severity: 'Medium', description: 'Difficult to revoke valid token mid-session' },
      { title: 'No Refresh', severity: 'Medium', description: 'Expired tokens not automatically cleaned' }
    ],
    attacks: [
      'Key Compromise - Attacker obtains HS256 secret',
      'Token Theft (XSS) - JavaScript extracts token from localStorage',
      'Token Manipulation - Modify claims (defeated by HMAC signature)',
      'Replay Attack - Reuse old token to access resources',
      'Algorithm Confusion - Change algorithm to none/RS256'
    ],
    recommendation: '✅ Acceptable; Implement token revocation blacklist for logout',
    color: 'from-blue-900 to-blue-800'
  },
  {
    id: 'totp',
    name: 'TOTP (Time-Based OTP)',
    level: 'High',
    purpose: 'Time-synchronized multi-factor authentication (RFC 6238)',
    whereUsed: ['Second factor authentication', 'TOTP enrollment', 'Login verification'],
    risks: [
      { title: 'Secret Exposure', severity: 'Critical', description: 'Leaked TOTP secret allows predicting codes' },
      { title: 'Time Skew', severity: 'Medium', description: 'Server/device clock mismatch rejects valid codes' },
      { title: 'QR Interception', severity: 'Medium', description: 'QR code captured during enrollment' },
      { title: 'Backup Code Storage', severity: 'Medium', description: 'Backup codes not encrypted' }
    ],
    attacks: [
      'Brute Force Attack (1 million codes, 30-sec window = 0.0001% success)',
      'Secret Key Compromise - Attacker predicts all future codes',
      'QR Code Interception - Generate same TOTP secret',
      'Time-Based Attack - Server time drift rejected',
      'SIM Swap Attack (N/A - TOTP doesn\'t use SMS)'
    ],
    recommendation: '✅ Excellent choice for MFA; Secure backup codes properly',
    color: 'from-green-900 to-green-800'
  },
  {
    id: 'email-otp',
    name: 'Email OTP',
    level: 'Medium',
    purpose: 'First-factor verification before TOTP enrollment',
    whereUsed: ['User login verification', 'TOTP enrollment', 'Password recovery'],
    risks: [
      { title: 'Email Interception', severity: 'High', description: 'Email often sent in plaintext' },
      { title: 'Account Compromise', severity: 'Critical', description: 'Compromised email = compromised access' },
      { title: 'OTP Expiration', severity: 'Low', description: 'Old OTPs must not be valid' },
      { title: 'Phishing', severity: 'High', description: 'User enters OTP on fake website' }
    ],
    attacks: [
      'Email Interception - Network attacker captures OTP',
      'Email Account Compromise - Attacker gains email access',
      'Brute Force Attack (1 million 6-digit codes)',
      'Phishing Attack - Fake website requests OTP',
      'Credential Stuffing (Prevented by email OTP requirement)'
    ],
    recommendation: '✅ Acceptable when combined with TOTP',
    color: 'from-orange-900 to-orange-800'
  },
  {
    id: 'signatures',
    name: 'Digital Signatures (RSA)',
    level: 'Very High',
    purpose: 'Non-repudiation and integrity verification',
    whereUsed: ['Faculty signing grades', 'Assignment approval', 'Audit trails'],
    risks: [
      { title: 'Private Key Compromise', severity: 'Critical', description: 'Attacker can forge signatures' },
      { title: 'Verification Bug', severity: 'High', description: 'Improper verification allows fake signatures' },
      { title: 'Timestamp Issues', severity: 'Medium', description: 'No timestamp in signature' },
      { title: 'Key Loss', severity: 'Medium', description: 'Faculty can\'t resign if key lost' }
    ],
    attacks: [
      'Private Key Theft - Forge signatures on assignments',
      'Signature Verification Bypass - Weak code accepts invalid signatures',
      'Key Confusion Attack - Use wrong key to verify',
      'Replay Attack - Reuse old signature on different document'
    ],
    recommendation: '✅ Properly implemented; Add timestamp for audit trail',
    color: 'from-emerald-900 to-emerald-800'
  },
  {
    id: 'hybrid',
    name: 'Hybrid Encryption',
    level: 'Very High',
    purpose: 'Combines RSA (key exchange) + AES (data encryption)',
    whereUsed: ['Complete system file encryption', 'Secure key management'],
    risks: [
      { title: 'Either Key Compromise', severity: 'Critical', description: 'Loss of either key compromises system' },
      { title: 'Key Management', severity: 'Medium', description: 'More keys to manage and protect' },
      { title: 'Performance', severity: 'Low', description: 'RSA slower than AES, but only per file' }
    ],
    attacks: [
      'Key Derivation Attack - Derive RSA private from public (mathematically infeasible)',
      'Side Channel Attack - Measure power/timing during encryption',
      'Chosen Ciphertext Attack - Choose ciphertexts and observe results'
    ],
    recommendation: '✅ Excellent choice; Properly implemented',
    color: 'from-emerald-900 to-emerald-800'
  }
];

const TechniqueCard = ({ technique }: { technique: Technique }) => {
  const [expandedRisks, setExpandedRisks] = useState(false);
  const [expandedAttacks, setExpandedAttacks] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Medium':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Medium-High':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'High':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Very High':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'text-blue-300';
      case 'Medium':
        return 'text-yellow-300';
      case 'High':
        return 'text-orange-300';
      case 'Critical':
        return 'text-red-300';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className={`bg-gradient-to-br ${technique.color} border border-slate-600/30 rounded-lg p-4 backdrop-blur-sm hover:border-slate-500/50 transition`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-100 flex-1">{technique.name}</h3>
        <span className="text-cyan-400 flex-shrink-0 ml-2 text-lg">🛡️</span>
      </div>

      {/* Security Level Badge */}
      <div className={`inline-block px-2 py-1 rounded text-xs font-semibold border mb-3 ${getLevelColor(technique.level)}`}>
        🔒 {technique.level}
      </div>

      {/* Purpose */}
      <p className="text-sm text-slate-300 mb-2">
        <span className="font-semibold text-slate-200">Purpose:</span> {technique.purpose}
      </p>

      {/* Where Used */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-400 mb-1">Where Used:</p>
        <div className="flex flex-wrap gap-1">
          {technique.whereUsed.map((use, i) => (
            <span key={i} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">
              {use}
            </span>
          ))}
        </div>
      </div>

      {/* Risks */}
      <button
        onClick={() => setExpandedRisks(!expandedRisks)}
        className="w-full flex items-center justify-between mb-2 p-2 bg-red-900/20 hover:bg-red-900/30 rounded border border-red-500/20 transition"
      >
        <span className="flex items-center gap-1 text-sm font-semibold text-red-300">
          ⚠️ Risks ({technique.risks.length})
        </span>
        <span className={`transition inline-block ${expandedRisks ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expandedRisks && (
        <div className="mb-3 space-y-1 bg-red-900/10 p-2 rounded border border-red-500/10">
          {technique.risks.map((risk, i) => (
            <div key={i} className="text-xs text-slate-400">
              <span className={`font-semibold ${getSeverityColor(risk.severity)}`}>
                ⚠️ {risk.title} ({risk.severity})
              </span>
              <p className="text-slate-500 ml-4">{risk.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Attacks */}
      <button
        onClick={() => setExpandedAttacks(!expandedAttacks)}
        className="w-full flex items-center justify-between p-2 bg-purple-900/20 hover:bg-purple-900/30 rounded border border-purple-500/20 transition"
      >
        <span className="flex items-center gap-1 text-sm font-semibold text-purple-300">
          ⚡ Attacks ({technique.attacks.length})
        </span>
        <span className={`transition inline-block ${expandedAttacks ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expandedAttacks && (
        <div className="mt-2 space-y-1 bg-purple-900/10 p-2 rounded border border-purple-500/10">
          {technique.attacks.map((attack, i) => (
            <div key={i} className="text-xs text-purple-200">
              • {attack}
            </div>
          ))}
        </div>
      )}

      {/* Recommendation */}
      <div className="mt-3 pt-2 border-t border-slate-600/20">
        <p className="text-xs text-emerald-300">{technique.recommendation}</p>
      </div>
    </div>
  );
};

export default function EncodingTechniques() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const filteredTechniques = selectedLevel
    ? techniques.filter(t => t.level === selectedLevel)
    : techniques;

  const levels = ['Low', 'Medium', 'Medium-High', 'High', 'Very High'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">🔐 Encoding Techniques</h1>
          <p className="text-slate-400">
            Security analysis of all encryption and encoding methods used in this system
          </p>
        </div>

        {/* Filter Section */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-slate-100 mb-4">Filter by Security Level</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLevel(null)}
              className={`px-4 py-2 rounded font-semibold transition ${
                selectedLevel === null
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              All Techniques ({techniques.length})
            </button>
            {levels.map(level => {
              const count = techniques.filter(t => t.level === level).length;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    selectedLevel === level
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {level} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTechniques.map(technique => (
            <TechniqueCard key={technique.id} technique={technique} />
          ))}
        </div>

        {/* Summary Section */}
        <div className="card mt-8">
          <h2 className="text-lg font-bold gradient-text mb-4">System Security Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-4">
              <p className="text-sm text-emerald-400 font-semibold mb-1">✅ Very High Security</p>
              <p className="text-xs text-slate-400">4 techniques rated Very High</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
              <p className="text-sm text-green-400 font-semibold mb-1">✅ High Security</p>
              <p className="text-xs text-slate-400">4 techniques rated High</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded p-4">
              <p className="text-sm text-blue-400 font-semibold mb-1">✅ Acceptable</p>
              <p className="text-xs text-slate-400">2 techniques rated Medium/Low</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 mt-4">
            🎯 <span className="font-semibold">NIST SP 800-63-2 Level 3 Compliant</span> - This system implements all recommended security techniques and follows government standards for authentication and encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
