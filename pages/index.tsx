'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Server,
  Terminal,
  Shield,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Users,
  BarChart3,
  ArrowRight,
  Check,
  X,
  Menu,
  ChevronRight,
  Zap,
  Globe,
  RefreshCw,
  Eye,
  FileText,
  Settings,
  Play,
  Square,
  RotateCcw,
  MonitorUp,
  Cloud,
  Database,
  GitBranch,
  ExternalLink
} from 'lucide-react';
import styles from '@/styles/landing.module.scss';

// Custom hook for intersection observer animations
const useIntersectionObserver = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        let startTime: number;
        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={countRef}>{count.toLocaleString()}{suffix}</span>;
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('servers');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer hooks for animations
  const heroAnim = useIntersectionObserver();
  const socialProofAnim = useIntersectionObserver();
  const featuresAnim = useIntersectionObserver();
  const capabilitiesAnim = useIntersectionObserver();
  const diffAnim = useIntersectionObserver();
  const previewAnim = useIntersectionObserver();
  const ctaAnim = useIntersectionObserver();

  return (
    <div className={styles.landing}>
      <Head>
        <title>Hosten | Own Your Infrastructure. Control Your Servers.</title>
        <meta name="description" content="Hosten is a platform for remote server and process management, giving you full control over your own infrastructure without vendor lock-in." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContainer}>
          <Link href="/" className={styles.logo}>
            <Server size={28} />
            Hosten<span>.</span>
          </Link>

          <nav className={styles.nav}>
            <a href="#features">Features</a>
            <a href="#capabilities">How it Works</a>
            <a href="#security">Security</a>
            <a href="#preview">Product</a>
          </nav>

          <div className={styles.headerActions}>
            <Link href="/login" className={styles.loginBtn}>
              Login
            </Link>
            <Link href="/register" className={styles.registerBtn}>
              Get Started <ArrowRight size={16} />
            </Link>
          </div>

          <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <Zap size={16} />
              Infrastructure You Own
            </div>

            <h1>
              Stop Renting Servers.<br />
              <span className={styles.highlight}>Start Owning Them.</span>
            </h1>

            <p className={styles.subtitle}>
              Hosten gives you complete remote control over your own servers, machines, and cloud instances.
              Manage processes, monitor health, and scale on your terms — no vendor lock-in.
            </p>

            <div className={styles.heroCtas}>
              <Link href="/register" className={styles.primaryCta}>
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link href="/login" className={styles.secondaryCta}>
                Access Dashboard
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>99.9%</div>
                <div className={styles.statLabel}>Uptime Monitored</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>&lt;50ms</div>
                <div className={styles.statLabel}>Command Latency</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>24/7</div>
                <div className={styles.statLabel}>Real-time Monitoring</div>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.dashboardPreview}>
              <div className={styles.previewHeader}>
                <span className={`${styles.dot} ${styles.red}`}></span>
                <span className={`${styles.dot} ${styles.yellow}`}></span>
                <span className={`${styles.dot} ${styles.green}`}></span>
                <span>hosten.app/dashboard</span>
              </div>
              <div className={styles.previewContent}>
                <div className={styles.serverList}>
                  <div className={styles.serverItem}>
                    <div className={styles.serverInfo}>
                      <div className={styles.serverIcon}>
                        <Server size={20} />
                      </div>
                      <div className={styles.serverDetails}>
                        <h4>prod-api-01</h4>
                        <span>4 cores • 16GB RAM</span>
                      </div>
                    </div>
                    <div className={styles.serverStatus}>
                      <span className={`${styles.statusDot} ${styles.online}`}></span>
                      <span>Online</span>
                    </div>
                  </div>
                  <div className={styles.serverItem}>
                    <div className={styles.serverInfo}>
                      <div className={styles.serverIcon}>
                        <Database size={20} />
                      </div>
                      <div className={styles.serverDetails}>
                        <h4>db-primary</h4>
                        <span>8 cores • 32GB RAM</span>
                      </div>
                    </div>
                    <div className={styles.serverStatus}>
                      <span className={`${styles.statusDot} ${styles.online}`}></span>
                      <span>Online</span>
                    </div>
                  </div>
                  <div className={styles.serverItem}>
                    <div className={styles.serverInfo}>
                      <div className={styles.serverIcon}>
                        <Globe size={20} />
                      </div>
                      <div className={styles.serverDetails}>
                        <h4>cdn-edge-eu</h4>
                        <span>2 cores • 8GB RAM</span>
                      </div>
                    </div>
                    <div className={styles.serverStatus}>
                      <span className={`${styles.statusDot} ${styles.online}`}></span>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.floatingCard} ${styles.metrics}`}>
              <div className={styles.metricValue}>99.9%</div>
              <div className={styles.metricLabel}>Uptime</div>
            </div>

            <div className={`${styles.floatingCard} ${styles.processes}`}>
              <Activity size={20} />
              <div className={styles.processInfo}>
                <span><strong>12</strong> processes running</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className={styles.socialProof} ref={socialProofAnim.ref}>
        <div className={styles.container}>
          <div className={styles.metricsGrid}>
            <div className={`${styles.metricCard} ${styles.animate} ${socialProofAnim.isVisible ? styles.visible : ''}`}>
              <div className={styles.metricIcon}>
                <Server size={28} />
              </div>
              <div className={styles.metricNumber}>
                <AnimatedCounter end={200} suffix="+" />
              </div>
              <div className={styles.metricLabel}>Servers Registered</div>
            </div>
            <div className={`${styles.metricCard} ${styles.animate} ${socialProofAnim.isVisible ? styles.visible : ''}`} style={{ transitionDelay: '0.1s' }}>
              <div className={styles.metricIcon}>
                <Cpu size={28} />
              </div>
              <div className={styles.metricNumber}>
                <AnimatedCounter end={1200} suffix="+" />
              </div>
              <div className={styles.metricLabel}>Processes Managed</div>
            </div>
            <div className={`${styles.metricCard} ${styles.animate} ${socialProofAnim.isVisible ? styles.visible : ''}`} style={{ transitionDelay: '0.2s' }}>
              <div className={styles.metricIcon}>
                <Activity size={28} />
              </div>
              <div className={styles.metricNumber}>
                99.9%
              </div>
              <div className={styles.metricLabel}>Uptime Monitored</div>
            </div>
            <div className={`${styles.metricCard} ${styles.animate} ${socialProofAnim.isVisible ? styles.visible : ''}`} style={{ transitionDelay: '0.3s' }}>
              <div className={styles.metricIcon}>
                <MonitorUp size={28} />
              </div>
              <div className={styles.metricNumber}>
                <AnimatedCounter end={50} suffix="+" />
              </div>
              <div className={styles.metricLabel}>Projects in Production</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features" ref={featuresAnim.ref}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              <Zap size={14} /> Core Features
            </span>
            <h2>Everything You Need to Manage Your Infrastructure</h2>
            <p>
              From process control to security, Hosten provides all the tools you need
              to manage your own servers effectively.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={`${styles.featureCard} ${styles.animate} ${featuresAnim.isVisible ? styles.visible : ''}`}>
              <div className={styles.featureIcon}>
                <HardDrive size={24} />
              </div>
              <h3>Infrastructure Ownership</h3>
              <p>Your servers, your rules. Hosten connects to your existing infrastructure without taking control away from you.</p>
            </div>

            <div className={`${styles.featureCard} ${styles.animate} ${featuresAnim.isVisible ? styles.visible : ''}`} style={{ transitionDelay: '0.1s' }}>
              <div className={styles.featureIcon}>
                <Globe size={24} />
              </div>
              <h3>Remote Server Control</h3>
              <p>Manage any server from anywhere through a secure web interface. Execute commands, restart services, and more.</p>
            </div>

            <div className={`${styles.featureCard} ${styles.animate} ${featuresAnim.isVisible ? styles.visible : ''}`} style={{ transitionDelay: '0.2s' }}>
              <div className={styles.featureIcon}>
                <BarChart3 size={24} />
              </div>
              <h3>Independent Scalability</h3>
              <p>Scale by upgrading your hardware, not subscription plans. Add more machines as your needs grow.</p>
            </div>

            <div className={`${styles.featureCard} ${styles.animate} ${featuresAnim.isVisible ? styles.visible : ''}`} style={{ transitionDelay: '0.3s' }}>
              <div className={styles.featureIcon}>
                <Lock size={24} />
              </div>
              <h3>Secure Authentication</h3>
              <p>Token-based authentication ensures only authorized users can access and manage your servers.</p>
            </div>

            <div className={`${styles.featureCard} ${styles.animate} ${featuresAnim.isVisible ? styles.visible : ''}`} style={{ transitionDelay: '0.4s' }}>
              <div className={styles.featureIcon}>
                <Users size={24} />
              </div>
              <h3>Permission-Based Access</h3>
              <p>Define roles and permissions to control exactly who can do what across your infrastructure.</p>
            </div>

            <div className={`${styles.featureCard} ${styles.animate} ${featuresAnim.isVisible ? styles.visible : ''}`} style={{ transitionDelay: '0.5s' }}>
              <div className={styles.featureIcon}>
                <Eye size={24} />
              </div>
              <h3>Monitoring & Observability</h3>
              <p>Real-time logs, heartbeats, and server status. Know what's happening at all times.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Capabilities Section */}
      <section className={styles.capabilities} id="capabilities" ref={capabilitiesAnim.ref}>
        <div className={styles.container}>
          <div className={styles.capabilitiesContent}>
            <div className={`${styles.capabilitiesText} ${styles.animateLeft} ${capabilitiesAnim.isVisible ? styles.visible : ''}`}>
              <span className={styles.sectionTag}>
                <Terminal size={14} /> Technical Capabilities
              </span>
              <h2>Built for Engineers Who Want Control</h2>
              <p>
                Hosten provides a distributed architecture that separates the management core
                from your server clients, giving you flexibility and reliability.
              </p>

              <ul className={styles.capabilitiesList}>
                <li>
                  <Check size={18} />
                  <span><strong>Remote Process Control</strong> — Start, stop, and restart processes with a click</span>
                </li>
                <li>
                  <Check size={18} />
                  <span><strong>Socket Communication</strong> — Real-time bidirectional server communication</span>
                </li>
                <li>
                  <Check size={18} />
                  <span><strong>Token Authentication</strong> — Secure API access with JWT tokens</span>
                </li>
                <li>
                  <Check size={18} />
                  <span><strong>Role-Based Access</strong> — Fine-grained permission control</span>
                </li>
                <li>
                  <Check size={18} />
                  <span><strong>Live Server Status</strong> — Heartbeats and health monitoring</span>
                </li>
                <li>
                  <Check size={18} />
                  <span><strong>Log Streaming</strong> — Real-time log access and command execution</span>
                </li>
              </ul>
            </div>

            <div className={`${styles.capabilitiesVisual} ${styles.animateRight} ${capabilitiesAnim.isVisible ? styles.visible : ''}`}>
              <div className={styles.terminalWindow}>
                <div className={styles.terminalHeader}>
                  <span className={`${styles.dot} ${styles.red}`}></span>
                  <span className={`${styles.dot} ${styles.yellow}`}></span>
                  <span className={`${styles.dot} ${styles.green}`}></span>
                  <span>hosten-cli</span>
                </div>
                <div className={styles.terminalBody}>
                  <div className={styles.line}>
                    <span className={styles.prompt}>$</span>
                    <span className={styles.command}> hosten server list</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.output}>┌─────────────┬────────┬─────────┐</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.output}>│ Server      │ Status │ Procs   │</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.output}>├─────────────┼────────┼─────────┤</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.output}>│ prod-api-01 │ </span>
                    <span className={styles.success}>online</span>
                    <span className={styles.output}> │ 4       │</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.output}>│ db-primary  │ </span>
                    <span className={styles.success}>online</span>
                    <span className={styles.output}> │ 2       │</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.output}>└─────────────┴────────┴─────────┘</span>
                  </div>
                  <div className={styles.line}>&nbsp;</div>
                  <div className={styles.line}>
                    <span className={styles.prompt}>$</span>
                    <span className={styles.command}> hosten process restart api-server</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.info}>ℹ Sending restart command...</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.success}>✓ Process api-server restarted successfully</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className={styles.differentiation} id="security" ref={diffAnim.ref}>
        <div className={styles.container}>
          <div className={`${styles.diffContent} ${styles.animate} ${diffAnim.isVisible ? styles.visible : ''}`}>
            <span className={styles.sectionTag}>
              <Shield size={14} /> Why Hosten
            </span>
            <h2>Your Infrastructure, Your Control</h2>

            <p className={styles.quote}>
              "Hosten lets you manage your own servers instead of forcing you onto a provider's infrastructure.
              <strong> You scale by upgrading your hardware — not by upgrading plans.</strong>"
            </p>

            <div className={styles.comparisonGrid}>
              <div className={`${styles.comparisonCard} ${styles.traditional}`}>
                <h4>
                  <X size={18} />
                  Traditional PaaS
                </h4>
                <ul>
                  <li><X size={16} /> Vendor lock-in</li>
                  <li><X size={16} /> Pay per usage, costs scale unpredictably</li>
                  <li><X size={16} /> Limited control over infrastructure</li>
                  <li><X size={16} /> Data on third-party servers</li>
                  <li><X size={16} /> Dependent on provider's uptime</li>
                </ul>
              </div>

              <div className={`${styles.comparisonCard} ${styles.hosten}`}>
                <h4>
                  <Check size={18} />
                  With Hosten
                </h4>
                <ul>
                  <li><Check size={16} /> Full ownership and freedom</li>
                  <li><Check size={16} /> Fixed hardware costs, predictable scaling</li>
                  <li><Check size={16} /> Complete control over every aspect</li>
                  <li><Check size={16} /> Your data stays on your servers</li>
                  <li><Check size={16} /> You control your own uptime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className={styles.preview} id="preview" ref={previewAnim.ref}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              <Eye size={14} /> Product Preview
            </span>
            <h2>See Hosten in Action</h2>
            <p>
              A clean, intuitive dashboard that gives you complete visibility
              and control over your entire infrastructure.
            </p>
          </div>

          <div className={styles.previewTabs}>
            <button
              className={`${styles.tab} ${activePreviewTab === 'servers' ? styles.active : ''}`}
              onClick={() => setActivePreviewTab('servers')}
            >
              Servers
            </button>
            <button
              className={`${styles.tab} ${activePreviewTab === 'processes' ? styles.active : ''}`}
              onClick={() => setActivePreviewTab('processes')}
            >
              Processes
            </button>
            <button
              className={`${styles.tab} ${activePreviewTab === 'logs' ? styles.active : ''}`}
              onClick={() => setActivePreviewTab('logs')}
            >
              Logs
            </button>
          </div>

          <div className={`${styles.previewWindow} ${styles.animateScale} ${previewAnim.isVisible ? styles.visible : ''}`}>
            <div className={styles.windowHeader}>
              <span className={`${styles.dot} ${styles.red}`}></span>
              <span className={`${styles.dot} ${styles.yellow}`}></span>
              <span className={`${styles.dot} ${styles.green}`}></span>
              <span className={styles.windowTitle}>Hosten Dashboard</span>
            </div>
            <div className={styles.windowContent}>
              <div className={styles.mockupContent}>
                <div className={styles.sidebar}>
                  <h4>Navigation</h4>
                  <div className={styles.navItems}>
                    <div className={`${styles.navItem} ${styles.active}`}>
                      <Server size={16} /> Servers
                    </div>
                    <div className={styles.navItem}>
                      <Cpu size={16} /> Processes
                    </div>
                    <div className={styles.navItem}>
                      <Shield size={16} /> Permissions
                    </div>
                    <div className={styles.navItem}>
                      <Users size={16} /> Roles
                    </div>
                    <div className={styles.navItem}>
                      <FileText size={16} /> Logs
                    </div>
                    <div className={styles.navItem}>
                      <Settings size={16} /> Settings
                    </div>
                  </div>
                </div>

                <div className={styles.mainArea}>
                  <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Online Servers</div>
                      <div className={`${styles.statValue} ${styles.green}`}>12</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Active Processes</div>
                      <div className={`${styles.statValue} ${styles.blue}`}>47</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Alerts</div>
                      <div className={`${styles.statValue} ${styles.yellow}`}>2</div>
                    </div>
                  </div>

                  <div className={styles.tableArea}>
                    <div className={styles.tableHeader}>
                      <span>Process Name</span>
                      <span>Status</span>
                      <span>CPU</span>
                      <span>Memory</span>
                    </div>
                    <div className={styles.tableRow}>
                      <div className={styles.processName}>
                        <div className={styles.processIcon}>API</div>
                        api-server
                      </div>
                      <span className={`${styles.statusBadge} ${styles.online}`}>Online</span>
                      <span className={styles.cpuUsage}>12%</span>
                      <span className={styles.memUsage}>256MB</span>
                    </div>
                    <div className={styles.tableRow}>
                      <div className={styles.processName}>
                        <div className={styles.processIcon}>WEB</div>
                        web-frontend
                      </div>
                      <span className={`${styles.statusBadge} ${styles.online}`}>Online</span>
                      <span className={styles.cpuUsage}>8%</span>
                      <span className={styles.memUsage}>128MB</span>
                    </div>
                    <div className={styles.tableRow}>
                      <div className={styles.processName}>
                        <div className={styles.processIcon}>WKR</div>
                        background-worker
                      </div>
                      <span className={`${styles.statusBadge} ${styles.stopped}`}>Stopped</span>
                      <span className={styles.cpuUsage}>0%</span>
                      <span className={styles.memUsage}>0MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta} ref={ctaAnim.ref}>
        <div className={styles.container}>
          <div className={`${styles.ctaContent} ${styles.animate} ${ctaAnim.isVisible ? styles.visible : ''}`}>
            <h2>Take Control of Your Infrastructure</h2>
            <p>
              Stop paying for resources you don't need. Start managing your own servers
              with full visibility and control.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/register" className={styles.primaryCta}>
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link href="/login" className={styles.secondaryCta}>
                Access Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.logo}>
                <Server size={24} />
                Hosten<span>.</span>
              </div>
              <p>
                Remote server and process management platform.
                Own your infrastructure, control your destiny.
              </p>
            </div>

            <div className={styles.footerColumn}>
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#capabilities">How it Works</a></li>
                <li><a href="#preview">Dashboard</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Status</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">GitHub</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.copyright}>
              © {new Date().getFullYear()} Hosten. All rights reserved.
            </div>
            <div className={styles.footerLinks}>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}