import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Sun, Moon, Search, BookOpen, CheckCircle, FileText, ShieldCheck, Library } from 'lucide-react'
import Logo from '../components/Logo'
import DarkVeil from '../components/DarkVeil'

export default function Landing() {
  const { isDark, toggleTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg font-body">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            {/* LegAI Logo - Open Book Design */}
            <Logo size="default" className="text-primary dark:text-white" />
            
         

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-light-hover dark:hover:bg-dark-hover transition"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-legal-slate" />}
              </button>
              {user ? (
                <button
                  onClick={() => navigate('/chat')}
                  className="px-5 py-2.5 bg-primary text-white font-medium hover:bg-primary-hover transition"
                >
                  Start Legal Research
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-5 py-2.5 text-primary dark:text-gray-300 border border-primary dark:border-gray-600 font-medium hover:bg-light-hover dark:hover:bg-dark-hover transition"
                  >
                    Sign In
                  </Link>
                  
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with DarkVeil Background - FULL WIDTH */}
      <section className="relative w-full" style={{ minHeight: '600px', backgroundColor: '#f5f5f3' }}>
        {/* DarkVeil Background Effect - Full Width with transparency */}
        <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: 0, opacity: 0.35 }}>
          <DarkVeil
            hueShift={230}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={2.7}
            scanlineFrequency={0}
            warpAmount={0}
          />
        </div>
        
        {/* Content on top of DarkVeil */}
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20" style={{ zIndex: 1 }}>
          <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold mb-6 leading-tight text-primary dark:text-white">
            Comprehensive Legal Research<br />for Indian Law
          </h1>
          
          <p className="text-xl text-legal-slate dark:text-gray-300 mb-4 leading-legal max-w-3xl mx-auto">
            Access the Indian Constitution, Penal Code, procedural statutes, and Supreme Court judgments through a unified research platform with verified source citations.
          </p>
          
          <p className="text-base text-legal-slate dark:text-gray-400 mb-10">
            For law students, advocates, and legal professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link 
              to="/login" 
              className="px-8 py-4 bg-primary text-white font-medium hover:bg-primary-hover transition"
            >
              Access Research Platform
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-white dark:bg-dark-surface text-primary dark:text-white border-2 border-primary dark:border-gray-600 font-medium hover:bg-light-hover dark:hover:bg-dark-hover transition"
            >
              Explore Legal Database
            </Link>
          </div>

          {/* Coverage Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-light-border dark:border-dark-border">
            <div className="text-center">
              <Library className="w-6 h-6 text-primary dark:text-accent-gold mx-auto mb-2" strokeWidth={1.5} />
              <span className="block text-sm font-medium text-legal-charcoal dark:text-gray-300">Constitution of India</span>
            </div>
            <div className="text-center">
              <BookOpen className="w-6 h-6 text-primary dark:text-accent-gold mx-auto mb-2" strokeWidth={1.5} />
              <span className="block text-sm font-medium text-legal-charcoal dark:text-gray-300">IPC & CrPC</span>
            </div>
            <div className="text-center">
              <FileText className="w-6 h-6 text-primary dark:text-accent-gold mx-auto mb-2" strokeWidth={1.5} />
              <span className="block text-sm font-medium text-legal-charcoal dark:text-gray-300">Case Law</span>
            </div>
            <div className="text-center">
              <ShieldCheck className="w-6 h-6 text-primary dark:text-accent-gold mx-auto mb-2" strokeWidth={1.5} />
              <span className="block text-sm font-medium text-legal-charcoal dark:text-gray-300">Source Verified</span>
            </div>
          </div>
        </div>

        {/* Research Query Example */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden">
            <div className="bg-light-bg dark:bg-dark-bg px-6 py-4 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-legal-slate" strokeWidth={1.5} />
                <span className="text-legal-charcoal dark:text-gray-300 font-medium">Sample Legal Query</span>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-start space-x-4 bg-light-bg dark:bg-dark-bg p-5 border-l-4 border-primary dark:border-accent-gold">
                  <span className="text-primary dark:text-accent-gold font-bold">Q.</span>
                  <p className="text-legal-charcoal dark:text-white font-medium text-lg">
                    What constitutes theft under the Indian Penal Code and what is the prescribed punishment?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-light-bg dark:bg-dark-bg p-6 border-l-4 border-accent-gold">
                  <h4 className="font-serif font-semibold text-primary dark:text-white mb-4 text-lg">Legal Analysis</h4>
                  
                  <div className="space-y-4 text-legal-charcoal dark:text-gray-300 leading-legal">
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-primary dark:text-accent-gold flex-shrink-0 mt-1" strokeWidth={1.5} />
                      <div>
                        <p className="font-medium text-primary dark:text-white">Section 378, IPC — Definition of Theft</p>
                        <p className="text-sm mt-1">Whoever intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-primary dark:text-accent-gold flex-shrink-0 mt-1" strokeWidth={1.5} />
                      <div>
                        <p className="font-medium text-primary dark:text-white">Section 379, IPC — Punishment for Theft</p>
                        <p className="text-sm mt-1">Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-light-border dark:border-dark-border">
                      <p className="text-xs text-legal-slate dark:text-gray-400 italic">
                        Source: The Indian Penal Code, 1860 (Act 45 of 1860)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="bg-white dark:bg-dark-surface py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-semibold text-primary dark:text-white mb-4">Research Capabilities</h2>
            <p className="text-xl text-legal-slate dark:text-gray-300 max-w-2xl mx-auto leading-legal">
              Systematic legal research methodology with verified statutory and judicial sources
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-light-border dark:border-dark-border p-8 hover:border-primary dark:hover:border-accent-gold transition-colors">
              <div className="w-12 h-12 border-2 border-primary dark:border-accent-gold flex items-center justify-center mb-5">
                <Search className="w-6 h-6 text-primary dark:text-accent-gold" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-primary dark:text-white">Contextual Retrieval</h3>
              <p className="text-legal-slate dark:text-gray-300 leading-legal">
                Retrieve relevant legal provisions and case law based on conceptual understanding, not limited to exact terminology matches.
              </p>
            </div>

            <div className="border border-light-border dark:border-dark-border p-8 hover:border-primary dark:hover:border-accent-gold transition-colors">
              <div className="w-12 h-12 border-2 border-primary dark:border-accent-gold flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6 text-primary dark:text-accent-gold" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-primary dark:text-white">Verified Legal Sources</h3>
              <p className="text-legal-slate dark:text-gray-300 leading-legal">
                All responses include citations from authoritative legal texts: Constitution of India, Indian Penal Code, and appellate court decisions.
              </p>
            </div>

            <div className="border border-light-border dark:border-dark-border p-8 hover:border-primary dark:hover:border-accent-gold transition-colors">
              <div className="w-12 h-12 border-2 border-primary dark:border-accent-gold flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6 text-primary dark:text-accent-gold" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-primary dark:text-white">Source-Based Responses</h3>
              <p className="text-legal-slate dark:text-gray-300 leading-legal">
                Answers derived exclusively from indexed legal documents. No extrapolation or inference beyond retrieved statutory text.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Sources Section */}
      <section id="sources" className="w-full py-20" style={{ backgroundColor: '#9a9a9a' }}>
        <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-semibold text-primary dark:text-white mb-4">Legal Database Coverage</h2>
          <p className="text-xl text-legal-slate dark:text-gray-300 max-w-2xl mx-auto leading-legal">
            Comprehensive collection of Indian statutory and case law materials
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-6">
            <h3 className="font-serif font-semibold text-lg text-primary dark:text-white mb-3">Constitutional Law</h3>
            <ul className="space-y-2 text-legal-slate dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary dark:text-accent-gold mr-2 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Constitution of India (Fundamental Rights, Directive Principles)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary dark:text-accent-gold mr-2 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Constitutional Amendments</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-6">
            <h3 className="font-serif font-semibold text-lg text-primary dark:text-white mb-3">Criminal Law</h3>
            <ul className="space-y-2 text-legal-slate dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary dark:text-accent-gold mr-2 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Indian Penal Code, 1860</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary dark:text-accent-gold mr-2 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Code of Criminal Procedure</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-6">
            <h3 className="font-serif font-semibold text-lg text-primary dark:text-white mb-3">Civil & Contract Law</h3>
            <ul className="space-y-2 text-legal-slate dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary dark:text-accent-gold mr-2 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Indian Contract Act provisions</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary dark:text-accent-gold mr-2 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Evidence Act excerpts</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-6">
            <h3 className="font-serif font-semibold text-lg text-primary dark:text-white mb-3">Data Protection</h3>
            <ul className="space-y-2 text-legal-slate dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary dark:text-accent-gold mr-2 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Digital Personal Data Protection Act materials</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary dark:text-accent-gold mr-2 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>IT Act provisions</span>
              </li>
            </ul>
          </div>
        </div>
        </div>
      </section>

      {/* Research Methodology Section */}
      <section id="methodology" className="bg-white dark:bg-dark-surface py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-semibold text-primary dark:text-white mb-4">Research Methodology</h2>
            <p className="text-xl text-legal-slate dark:text-gray-300 leading-legal">
              Structured approach to legal document retrieval and analysis
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-6 border-l-4 border-primary dark:border-accent-gold bg-light-bg dark:bg-dark-bg">
              <div className="w-8 h-8 border-2 border-primary dark:border-accent-gold flex items-center justify-center flex-shrink-0 text-primary dark:text-accent-gold font-semibold">
                1
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg text-primary dark:text-white mb-2">Query Analysis</h3>
                <p className="text-legal-slate dark:text-gray-300 leading-legal">
                  System analyzes legal terminology and concepts within the query to determine relevant statutory provisions and case law categories.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 border-l-4 border-primary dark:border-accent-gold bg-light-bg dark:bg-dark-bg">
              <div className="w-8 h-8 border-2 border-primary dark:border-accent-gold flex items-center justify-center flex-shrink-0 text-primary dark:text-accent-gold font-semibold">
                2
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg text-primary dark:text-white mb-2">Document Retrieval</h3>
                <p className="text-legal-slate dark:text-gray-300 leading-legal">
                  Indexed legal database searched for relevant constitutional provisions, statutory sections, and judicial precedents matching query parameters.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 border-l-4 border-primary dark:border-accent-gold bg-light-bg dark:bg-dark-bg">
              <div className="w-8 h-8 border-2 border-primary dark:border-accent-gold flex items-center justify-center flex-shrink-0 text-primary dark:text-accent-gold font-semibold">
                3
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg text-primary dark:text-white mb-2">Source Verification</h3>
                <p className="text-legal-slate dark:text-gray-300 leading-legal">
                  Retrieved provisions presented with complete statutory citations and section references for independent verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-16" style={{ backgroundColor: '#9a9a9a' }}>
        <div className="max-w-7xl mx-auto px-6">
        <div className="bg-primary dark:bg-dark-surface border dark:border-accent-gold p-12 text-center">
          <h2 className="text-4xl font-serif font-semibold text-white mb-4">Begin Your Legal Research</h2>
          <p className="text-xl text-gray-200 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-legal">
            Access comprehensive Indian legal resources with verified source citations for reliable research outcomes.
          </p>
          <Link 
            to="/login" 
            className="inline-block px-10 py-4 bg-white dark:bg-accent-gold text-primary font-medium hover:bg-gray-100 dark:hover:bg-accent-gold-muted transition"
          >
            Access Platform
          </Link>
        </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-light-border dark:border-dark-border mt-16 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="small" className="text-primary dark:text-white mb-4 md:mb-0" />
            <p className="text-legal-slate dark:text-gray-400 text-sm">
              &copy; 2025 LegAI. For educational and research purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
