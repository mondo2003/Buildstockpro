'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { mockProducts } from '@/lib/mockData';

export default function LandingPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mobile-menu-btn') && !target.closest('.nav-list')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId.replace('#', ''));

    if (targetElement) {
      const headerHeight = (document.querySelector('.header') as HTMLElement)?.offsetHeight || 0;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  // Hero search handler
  const handleHeroSearch = () => {
    const query = heroSearchInput.trim();

    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/search');
    }
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleHeroSearch();
    }
  };

  // Reserve button handler
  const handleReserve = () => {
    try {
      // Add the demo product (Recycled Insulation Roll) to cart
      const demoProduct = mockProducts[0]; // First product is the insulation demo
      const supplierId = demoProduct.suppliers[0]?.id; // Use first supplier

      if (demoProduct && supplierId) {
        addItem(demoProduct, supplierId, 1);

        // Show success toast with option to view more products
        toast.success('Added to cart', {
          description: `${demoProduct.name} has been added to your cart`,
          action: {
            label: 'Browse More Products',
            onClick: () => router.push('/search'),
          },
          duration: 5000,
        });
      } else {
        // Fallback to just navigating to search if product not found
        router.push('/search');
      }
    } catch (error) {
      console.error('Error reserving product:', error);
      // Fallback: navigate to search page
      router.push('/search');
    }
  };

  // Contact form handler
  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const subject = encodeURIComponent(`BuildStop Pro Contact: ${contactFormData.subject}`);
    const body = encodeURIComponent(
      `Name: ${contactFormData.name}\n` +
      `Email: ${contactFormData.email}\n\n` +
      `Message:\n${contactFormData.message}`
    );

    // Open email client with pre-filled information
    window.location.href = `mailto:support@buildstoppro.com?subject=${subject}&body=${body}`;

    // Show success message
    alert('Thank you for your message! Your email client has been opened with your message pre-filled.');

    // Reset form
    setContactFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <>
      {/* Header */}
      <header className={`header ${isHeaderScrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          <a href="/search" className="logo">
            BuildStop <span className="highlight">Pro</span>
          </a>
          <nav className="nav">
            <ul className={`nav-list ${isMobileMenuOpen ? 'active' : ''}`}>
              <li>
                <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>Features</a>
              </li>
              <li>
                <a href="/search">Search</a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact</a>
              </li>
              <li>
                <Button asChild variant="secondary" className="btn btn-secondary">
                  <a href="/search">Get Started</a>
                </Button>
              </li>
            </ul>
            <button
              className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
              aria-label="Toggle Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container hero-container">
            <div className="hero-content">
              <h1>
                Sustainable Building Materials,{' '}
                <span className="text-gradient">Available Today</span>
              </h1>
              <p className="hero-text">
                Find the closest in-stock materials, check their carbon footprint, and build
                with confidence using rated eco-friendly products.
              </p>
              <div className="hero-search">
                <Input
                  type="text"
                  id="heroSearchInput"
                  placeholder="Search for materials (e.g., insulation, lumber, concrete...)"
                  className="hero-search-input"
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
                <Button onClick={handleHeroSearch} className="btn btn-primary btn-search">
                  Search
                </Button>
              </div>
              <div className="hero-actions">
                <Button asChild variant="default" className="btn btn-primary">
                  <a href="/search">Find Materials Nearby</a>
                </Button>
                <Button asChild variant="outline" className="btn btn-outline">
                  <a href="/search">Browse All Materials</a>
                </Button>
              </div>
            </div>

            {/* Mock Product Card Demo */}
            <div className="product-demo">
              <Card className="product-card">
                <div className="product-image">
                  <div className="badge-eco">🌿 Eco-Friendly</div>
                </div>
                <CardContent className="product-details">
                  <h3>Recycled Insulation Roll</h3>
                  <p className="product-desc">
                    High-performance thermal insulation made from 80% recycled glass.
                    significantly reduces heat loss.
                  </p>

                  <div className="product-meta">
                    <div className="rating">
                      <span className="stars">★★★★☆</span>
                      <span className="count">(128)</span>
                    </div>
                    <div className="carbon-stat">
                      <span className="label">Carbon Footprint:</span>
                      <span className="value low">12kg CO2e</span>
                    </div>
                  </div>

                  <div className="availability">
                    <div className="store-info">
                      <span className="icon">📍</span>
                      <div>
                        <strong>BuildBase - Camden</strong>
                        <span className="distance">0.8 miles away</span>
                      </div>
                    </div>
                    <div className="status in-stock">
                      ● In Stock (42 rolls)
                    </div>
                  </div>

                  <Button
                    className="full-width btn-sm btn-primary"
                    onClick={handleReserve}
                  >
                    Reserve for Pickup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features">
          <div className="container">
            <div className="section-header">
              <h2>Build Smarter, Build Greener</h2>
              <p>The only app that combines real-time stock availability with sustainability data.</p>
            </div>
            <div className="features-grid">
              <a href="/search" className="feature-card-link">
                <div className="feature-card">
                  <div className="icon-box">📍</div>
                  <h3>Local Pickup</h3>
                  <p>
                    Instant gratification. Accurate stock levels at merchants near you for same-day collection.
                  </p>
                  <span className="feature-link">Search Now →</span>
                </div>
              </a>
              <a href="/dashboard" className="feature-card-link">
                <div className="feature-card">
                  <div className="icon-box">🌱</div>
                  <h3>Eco-Intelligence</h3>
                  <p>
                    Make informed choices. See the carbon footprint and eco-credentials of every product before
                    you buy.
                  </p>
                  <span className="feature-link">View Dashboard →</span>
                </div>
              </a>
              <a href="/profile/stats" className="feature-card-link">
                <div className="feature-card">
                  <div className="icon-box">⭐</div>
                  <h3>Quality Assurance</h3>
                  <p>
                    Don't guess quality. Verified star ratings and detailed descriptions from fellow
                    tradespeople.
                  </p>
                  <span className="feature-link">See Stats →</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>Ready to Optimize Your Site?</h2>
            <p>Join thousands of contractors building smarter with BuildStop Pro.</p>
            <Button asChild size="lg" className="btn btn-primary btn-large">
              <a href="/search">Get Started Free</a>
            </Button>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact-section">
          <div className="container">
            <div className="section-header">
              <h2>Get in Touch</h2>
              <p>Have questions? We'd love to hear from you.</p>
            </div>
            <div className="contact-content">
              <div className="contact-info">
                <h3>Contact Information</h3>
                <div className="contact-item">
                  <span className="icon">📧</span>
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:support@buildstoppro.com">support@buildstoppro.com</a>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="icon">📍</span>
                  <div>
                    <strong>Address</strong>
                    <p>
                      BuildStop Pro<br />
                      United Kingdom
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="icon">🕐</span>
                  <div>
                    <strong>Support Hours</strong>
                    <p>
                      Monday - Friday: 8am - 6pm<br />
                      Saturday: 9am - 1pm
                    </p>
                  </div>
                </div>
              </div>
              <div className="contact-form-container">
                <h3>Send us a Message</h3>
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Your name"
                      value={contactFormData.name}
                      onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={contactFormData.subject}
                      onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="sales">Sales Question</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder="How can we help you?"
                      value={contactFormData.message}
                      onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="full-width btn btn-primary">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <a href="/search" className="logo">
              BuildStop <span className="highlight">Pro</span>
            </a>
            <p>&copy; 2024 BuildStop Pro. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact Us</a>
          </div>
        </div>
      </footer>
    </>
  );
}
