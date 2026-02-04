/**
 * Landing Page - Shows app features and security mechanisms
 * Visual explanation of file upload, encryption, hashing, and digital signatures
 */
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden">
            {/* Content */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-700/30">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            🔒 SecureSubmit
                        </h1>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all"
                        >
                            Sign In
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            Secure Student Assignment Submission
                        </h2>
                        <p className="text-2xl text-slate-300 mb-8">
                            Military-grade encryption meets digital signatures for academic integrity
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-2xl transition-all"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="border border-cyan-500/50 text-cyan-400 px-8 py-3 rounded-xl font-semibold hover:bg-cyan-500/10 transition-all"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features Overview */}
                <section id="features" className="max-w-7xl mx-auto px-4 py-20">
                    <h3 className="text-4xl font-bold text-center mb-16 gradient-text">
                        How SecureSubmit Works
                    </h3>

                    {/* Access Control Matrix */}
                    <div className="mb-20 bg-gradient-to-r from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-8">
                        <h4 className="text-3xl font-bold text-cyan-400 mb-6 text-center">🔐 Access Control Matrix</h4>
                        <p className="text-center text-slate-300 mb-8">Role-based permissions ensure secure and controlled access</p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-600/50">
                                        <th className="py-4 px-6 font-bold text-cyan-400">Role</th>
                                        <th className="py-4 px-6 font-bold text-cyan-400">Upload Assignment</th>
                                        <th className="py-4 px-6 font-bold text-cyan-400">View Own</th>
                                        <th className="py-4 px-6 font-bold text-cyan-400">View Others</th>
                                        <th className="py-4 px-6 font-bold text-cyan-400">Download Files</th>
                                        <th className="py-4 px-6 font-bold text-cyan-400">Grade</th>
                                        <th className="py-4 px-6 font-bold text-cyan-400">Manage Users</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-700/30 hover:bg-slate-800/30">
                                        <td className="py-4 px-6 font-bold text-purple-400">👨‍🎓 Student</td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-emerald-400 text-xl">✅</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-emerald-400 text-xl">✅</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-red-400 text-xl">❌</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-red-400 text-xl">❌</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-red-400 text-xl">❌</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-red-400 text-xl">❌</span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-slate-700/30 hover:bg-slate-800/30">
                                        <td className="py-4 px-6 font-bold text-blue-400">👨‍🏫 Faculty</td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-red-400 text-xl">❌</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-red-400 text-xl">❌</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-emerald-400 text-xl">✅</span>
                                            <span className="text-xs text-slate-400 block">Assigned Only</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-emerald-400 text-xl">✅</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-emerald-400 text-xl">✅</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-red-400 text-xl">❌</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-800/30">
                                        <td className="py-4 px-6 font-bold text-cyan-400">👑 Admin</td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-red-400 text-xl">❌</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-emerald-400 text-xl">✅</span>
                                            <span className="text-xs text-slate-400 block">All</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-emerald-400 text-xl">✅</span>
                                            <span className="text-xs text-slate-400 block">All</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-emerald-400 text-xl">✅</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-red-400 text-xl">❌</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-emerald-400 text-xl">✅</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>


                    {/* Student Upload Flow */}
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/30 border border-cyan-500/50">
                                <span className="text-2xl">📤</span>
                            </div>
                            <h4 className="text-3xl font-bold gradient-text">Step 1: Student Uploads Assignment</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            {/* Step 1 */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                                <div className="text-4xl mb-3">📝</div>
                                <h5 className="font-bold text-cyan-400 mb-2">1. Student Selects File</h5>
                                <p className="text-sm text-slate-300">
                                    Upload assignment in any format: PDF, DOC, DOCX, TXT, or ZIP
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                                <div className="text-4xl mb-3">🔐</div>
                                <h5 className="font-bold text-cyan-400 mb-2">2. File is Hashed</h5>
                                <p className="text-sm text-slate-300">
                                    SHA-256 cryptographic hash generates a unique fingerprint
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                                <div className="text-4xl mb-3">🔑</div>
                                <h5 className="font-bold text-cyan-400 mb-2">3. Encryption Key Generated</h5>
                                <p className="text-sm text-slate-300">
                                    Random AES-256 key (32 bytes) generated for file encryption
                                </p>
                            </div>

                            {/* Step 4 */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                                <div className="text-4xl mb-3">📦</div>
                                <h5 className="font-bold text-cyan-400 mb-2">4. File Stored Encrypted</h5>
                                <p className="text-sm text-slate-300">
                                    Encrypted file stored safely without exposure
                                </p>
                            </div>
                        </div>

                        {/* Detailed Upload Flow */}
                        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-8">
                            <h5 className="text-xl font-bold mb-6 text-cyan-400">📊 Upload Security Process</h5>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-2 h-24 bg-gradient-to-b from-cyan-500 to-blue-600 rounded"></div>
                                    <div>
                                        <p className="font-bold text-slate-100">Step 1: SHA-256 Hash Generation</p>
                                        <p className="text-sm text-slate-400">File content hashed using SHA-256 algorithm (256-bit)</p>
                                        <code className="text-xs bg-slate-950/50 border border-slate-700/30 rounded px-2 py-1 mt-2 inline-block text-cyan-300">
                                            File Hash: 64 hexadecimal characters
                                        </code>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-24 bg-gradient-to-b from-blue-500 to-purple-600 rounded"></div>
                                    <div>
                                        <p className="font-bold text-slate-100">Step 2: AES-256-CBC Encryption</p>
                                        <p className="text-sm text-slate-400">File encrypted using symmetric AES-256 in CBC mode</p>
                                        <code className="text-xs bg-slate-950/50 border border-slate-700/30 rounded px-2 py-1 mt-2 inline-block text-cyan-300">
                                            Key: 256-bit (32 bytes) random | IV: 128-bit (16 bytes) random
                                        </code>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-32 bg-gradient-to-b from-purple-500 to-pink-600 rounded"></div>
                                    <div>
                                        <p className="font-bold text-slate-100">Step 3: RSA-2048 Key Encryption</p>
                                        <p className="text-sm text-slate-400">
                                            AES key encrypted with faculty's RSA-2048 public key using OAEP padding
                                        </p>
                                        <code className="text-xs bg-slate-950/50 border border-slate-700/30 rounded px-2 py-1 mt-2 inline-block text-cyan-300">
                                            RSA-2048 Public Key → Encrypts AES-256 Key
                                        </code>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-20 bg-gradient-to-b from-pink-500 to-emerald-600 rounded"></div>
                                    <div>
                                        <p className="font-bold text-slate-100">Step 4: Secure Storage</p>
                                        <p className="text-sm text-slate-400">Only encrypted file and encrypted key stored in database</p>
                                        <code className="text-xs bg-slate-950/50 border border-slate-700/30 rounded px-2 py-1 mt-2 inline-block text-cyan-300">
                                            🔒 Only faculty with private key can decrypt
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hybrid Encryption Visualization */}
                    <div className="my-20 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-8">
                        <h4 className="text-3xl font-bold mb-8 gradient-text">🔄 Hybrid Encryption System</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🔑</div>
                                <h5 className="text-xl font-bold text-cyan-400 mb-3">AES-256 (Symmetric)</h5>
                                <div className="text-sm text-slate-300 space-y-2">
                                    <p>✓ Fast encryption/decryption</p>
                                    <p>✓ 256-bit symmetric key</p>
                                    <p>✓ CBC mode for security</p>
                                    <p>✓ Encrypts entire file</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="text-4xl text-cyan-400">+</div>
                            </div>
                            <div className="text-center">
                                <div className="text-6xl mb-4">🛡️</div>
                                <h5 className="text-xl font-bold text-blue-400 mb-3">RSA-2048 (Asymmetric)</h5>
                                <div className="text-sm text-slate-300 space-y-2">
                                    <p>✓ Secures encryption key</p>
                                    <p>✓ 2048-bit key pair</p>
                                    <p>✓ OAEP padding</p>
                                    <p>✓ Only faculty can decrypt</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Faculty Grading & Digital Signatures */}
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/30 border border-emerald-500/50">
                                <span className="text-2xl">✍️</span>
                            </div>
                            <h4 className="text-3xl font-bold text-emerald-400">Step 2: Faculty Grades & Signs</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            {/* Grade Step 1 */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
                                <div className="text-4xl mb-3">🔓</div>
                                <h5 className="font-bold text-emerald-400 mb-2">1. Faculty Decrypts</h5>
                                <p className="text-sm text-slate-300">
                                    Uses their RSA-2048 private key to decrypt AES key
                                </p>
                            </div>

                            {/* Grade Step 2 */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
                                <div className="text-4xl mb-3">📄</div>
                                <h5 className="font-bold text-emerald-400 mb-2">2. Reads Assignment</h5>
                                <p className="text-sm text-slate-300">
                                    Decrypts and reviews the student's work
                                </p>
                            </div>

                            {/* Grade Step 3 */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
                                <div className="text-4xl mb-3">⭐</div>
                                <h5 className="font-bold text-emerald-400 mb-2">3. Assigns Grade</h5>
                                <p className="text-sm text-slate-300">
                                    Enters marks (0-100) and feedback comments
                                </p>
                            </div>

                            {/* Grade Step 4 */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
                                <div className="text-4xl mb-3">🔏</div>
                                <h5 className="font-bold text-emerald-400 mb-2">4. Digital Signature</h5>
                                <p className="text-sm text-slate-300">
                                    Grade digitally signed with faculty's private key
                                </p>
                            </div>
                        </div>

                        {/* Digital Signature Details */}
                        <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/50 rounded-xl p-8">
                            <h5 className="text-xl font-bold mb-6 text-emerald-400">🔏 Digital Signature Process</h5>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-2 h-32 bg-gradient-to-b from-emerald-500 to-teal-600 rounded"></div>
                                    <div>
                                        <p className="font-bold text-slate-100">Step 1: SHA-256 Hash of File</p>
                                        <p className="text-sm text-slate-400">
                                            The same SHA-256 hash generated during upload is used for signing
                                        </p>
                                        <code className="text-xs bg-slate-950/50 border border-slate-700/30 rounded px-2 py-1 mt-2 inline-block text-emerald-300">
                                            File Hash (SHA-256): Proves file identity &amp; integrity
                                        </code>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-32 bg-gradient-to-b from-teal-500 to-cyan-600 rounded"></div>
                                    <div>
                                        <p className="font-bold text-slate-100">Step 2: RSA-2048 Signing with PKCS1v15</p>
                                        <p className="text-sm text-slate-400">
                                            Faculty's private key signs the file hash using RSA-2048 with PSS padding
                                        </p>
                                        <code className="text-xs bg-slate-950/50 border border-slate-700/30 rounded px-2 py-1 mt-2 inline-block text-emerald-300">
                                            Private Key + File Hash → Digital Signature
                                        </code>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-32 bg-gradient-to-b from-cyan-500 to-blue-600 rounded"></div>
                                    <div>
                                        <p className="font-bold text-slate-100">Step 3: Non-Repudiation & Integrity</p>
                                        <p className="text-sm text-slate-400">
                                            Signature proves faculty graded this exact file and marks cannot be changed
                                        </p>
                                        <code className="text-xs bg-slate-950/50 border border-slate-700/30 rounded px-2 py-1 mt-2 inline-block text-emerald-300">
                                            ✓ Only this faculty could sign | ✓ Cannot deny grading | ✓ Tampering detected
                                        </code>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-20 bg-gradient-to-b from-blue-500 to-purple-600 rounded"></div>
                                    <div>
                                        <p className="font-bold text-slate-100">Step 4: Student Verification</p>
                                        <p className="text-sm text-slate-400">
                                            Students can verify signature using faculty's public key
                                        </p>
                                        <code className="text-xs bg-slate-950/50 border border-slate-700/30 rounded px-2 py-1 mt-2 inline-block text-emerald-300">
                                            Public Key + Signature → Verification ✓
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Verification */}
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/30 border border-purple-500/50">
                                <span className="text-2xl">✅</span>
                            </div>
                            <h4 className="text-3xl font-bold text-purple-400">Step 3: Student Verifies Grade</h4>
                        </div>

                        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h5 className="text-xl font-bold text-purple-400 mb-4">What Student Can Verify:</h5>
                                    <ul className="space-y-3 text-slate-300">
                                        <li className="flex gap-3">
                                            <span className="text-purple-400">✓</span>
                                            <span>Faculty identity (via faculty public key)</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-purple-400">✓</span>
                                            <span>File was not tampered with (hash verification)</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-purple-400">✓</span>
                                            <span>Marks are authentic (signature verification)</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-purple-400">✓</span>
                                            <span>Faculty cannot deny grading this assignment</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="text-xl font-bold text-purple-400 mb-4">How Verification Works:</h5>
                                    <code className="text-xs bg-slate-950/50 border border-slate-700/30 rounded p-4 block text-purple-300 space-y-2">
                                        <div>1. Get faculty's public key</div>
                                        <div>2. Retrieve file hash (SHA-256)</div>
                                        <div>3. Retrieve digital signature</div>
                                        <div>4. Verify: PublicKey(Signature) == FileHash</div>
                                        <div>5. If match → Grade is authentic ✓</div>
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Features Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-8">
                            <h5 className="text-2xl font-bold text-cyan-400 mb-6">🔐 Upload Security</h5>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex gap-3">
                                    <span className="text-cyan-400 font-bold">SHA-256:</span>
                                    <span>Cryptographic hash for file integrity</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-cyan-400 font-bold">AES-256:</span>
                                    <span>Symmetric encryption of file content</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-cyan-400 font-bold">RSA-2048:</span>
                                    <span>Encryption of AES key with faculty public key</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-cyan-400 font-bold">Result:</span>
                                    <span>Only assigned faculty can decrypt</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-8">
                            <h5 className="text-2xl font-bold text-emerald-400 mb-6">✍️ Grading Security</h5>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex gap-3">
                                    <span className="text-emerald-400 font-bold">Digital Sig:</span>
                                    <span>RSA-2048 signature of file hash</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-emerald-400 font-bold">PSS Padding:</span>
                                    <span>Probabilistic secure padding for security</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-emerald-400 font-bold">Non-repudiation:</span>
                                    <span>Faculty cannot deny grading</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-emerald-400 font-bold">Result:</span>
                                    <span>Tamper-proof authenticated grades</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Key Algorithms */}
                    <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-8 mb-20">
                        <h4 className="text-2xl font-bold text-cyan-400 mb-8">🔑 Cryptographic Algorithms Used</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-600/30">
                                <h6 className="font-bold text-cyan-400 mb-3">Hashing</h6>
                                <div className="space-y-2 text-sm">
                                    <p className="text-slate-300"><strong>Algorithm:</strong> SHA-256</p>
                                    <p className="text-slate-300"><strong>Output:</strong> 256-bit (64 hex chars)</p>
                                    <p className="text-slate-300"><strong>Use:</strong> File integrity verification</p>
                                </div>
                            </div>
                            <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-600/30">
                                <h6 className="font-bold text-blue-400 mb-3">Symmetric Encryption</h6>
                                <div className="space-y-2 text-sm">
                                    <p className="text-slate-300"><strong>Algorithm:</strong> AES-256-CBC</p>
                                    <p className="text-slate-300"><strong>Key Size:</strong> 256-bit (32 bytes)</p>
                                    <p className="text-slate-300"><strong>Use:</strong> Fast file encryption</p>
                                </div>
                            </div>
                            <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-600/30">
                                <h6 className="font-bold text-purple-400 mb-3">Asymmetric Encryption</h6>
                                <div className="space-y-2 text-sm">
                                    <p className="text-slate-300"><strong>Algorithm:</strong> RSA-2048</p>
                                    <p className="text-slate-300"><strong>Key Size:</strong> 2048-bit</p>
                                    <p className="text-slate-300"><strong>Use:</strong> Key & signature encryption</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Chain */}
                    <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-8">
                        <h4 className="text-2xl font-bold text-emerald-400 mb-8">🔗 Trust Chain</h4>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                            <div className="flex-1">
                                <div className="bg-slate-950/50 rounded-lg p-4 border-2 border-cyan-500/50">
                                    <div className="text-3xl mb-2">👤</div>
                                    <p className="font-bold text-cyan-400">Student</p>
                                    <p className="text-xs text-slate-400 mt-1">Uploads assignment</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center">
                                <div className="text-3xl text-cyan-500">→</div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-slate-950/50 rounded-lg p-4 border-2 border-blue-500/50">
                                    <div className="text-3xl mb-2">🔐</div>
                                    <p className="font-bold text-blue-400">Encryption</p>
                                    <p className="text-xs text-slate-400 mt-1">File encrypted with faculty key</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center">
                                <div className="text-3xl text-blue-500">→</div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-slate-950/50 rounded-lg p-4 border-2 border-purple-500/50">
                                    <div className="text-3xl mb-2">👨‍🏫</div>
                                    <p className="font-bold text-purple-400">Faculty</p>
                                    <p className="text-xs text-slate-400 mt-1">Grades & signs with private key</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center">
                                <div className="text-3xl text-purple-500">→</div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-slate-950/50 rounded-lg p-4 border-2 border-emerald-500/50">
                                    <div className="text-3xl mb-2">✅</div>
                                    <p className="font-bold text-emerald-400">Verified</p>
                                    <p className="text-xs text-slate-400 mt-1">Student verifies authenticity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <h3 className="text-4xl font-bold mb-6 gradient-text">Ready to Get Started?</h3>
                    <p className="text-xl text-slate-300 mb-8">
                        Experience secure, verified academic submissions with military-grade encryption
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all text-lg"
                    >
                        Sign In Now
                    </button>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-700/30 mt-20 py-8 text-center text-slate-400">
                    <p>🔒 SecureSubmit - Secure Student Assignment Submission System</p>
                    <p className="text-sm mt-2">Military-grade encryption meets academic integrity</p>
                </footer>
            </div>
        </div>
    );
};
