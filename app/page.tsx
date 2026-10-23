'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';

import {
  ShieldCheck,
  Wifi,
  KeyRound,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Menu,
  X,
  Building2,
  Users2,
  DoorOpen,
  ArrowUpRight,
  BedDouble,
  BookOpen,
  Download,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AMENITIES = [
  {
    icon: ShieldCheck,
    title: '24/7 Monitored Security',
    description: 'Round-the-clock guard stations, biometric / QR-verified ingress, and CCTV coverage across all floors.',
  },
  {
    icon: Wifi,
    title: 'High-Speed Fiber Internet',
    description: 'Dedicated high-speed connectivity with study lounges optimized for online classes and research.',
  },
  {
    icon: KeyRound,
    title: 'Smart Digital Passes',
    description: 'Instant contactless QR code access for residents and streamlined digital guest pre-registration.',
  },
  {
    icon: BedDouble,
    title: 'Furnished Living Spaces',
    description: 'Ergonomic study desks, personal storage lockers, individual power outlets, and air-conditioned rooms.',
  },
  {
    icon: BookOpen,
    title: 'Quiet Study Halls',
    description: 'Sound-dampened communal study spaces designed for focused learning and academic productivity.',
  },
  {
    icon: Sparkles,
    title: 'Clean & Maintained Facilities',
    description: 'Daily housekeeping in common areas, sanitization rounds, and rapid-response maintenance staff.',
  },
];

const ROOM_TYPES = [
  {
    name: 'Solo Suite',
    capacity: '1 Resident',
    price: 'Starting at ₱6,500 / mo',
    desc: 'Private quiet room with an en-suite desk, personal wardrobe, and private bath.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    tags: ['Private', 'Air-conditioned', 'Study Desk'],
  },
  {
    name: 'Double Shared Room',
    capacity: '2 Residents',
    price: 'Starting at ₱4,200 / mo',
    desc: 'Spacious twin arrangement with dedicated study zones, shared vanity, and individual lockers.',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    tags: ['Twin Bed', 'High-Speed WiFi', 'Balcony'],
  },
  {
    name: 'Quad Dorm Room',
    capacity: '4 Residents',
    price: 'Starting at ₱2,800 / mo',
    desc: 'Budget-friendly community dorm with ergonomic bunk setups and ample personal storage.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    tags: ['Community', 'En-suite Bath', 'Lockers'],
  },
];

const GALLERY = [
  {
    title: 'Modern Study Lounge',
    category: 'Common Area',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Resident Bedroom',
    category: 'Living Space',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Community Dining & Pantry',
    category: 'Amenities',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Secure Access Reception',
    category: 'Security',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  },
];

const STATS = [
  { label: 'Registered Residents', value: '450+' },
  { label: 'Available Rooms', value: '120+' },
  { label: 'Security Uptime', value: '99.9%' },
  { label: 'Average Satisfaction', value: '4.9 / 5' },
];

export default function DormitoryLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
      {/* Top Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-background/85 backdrop-blur-md border-b border-border shadow-xs'
            : 'bg-transparent'
          }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <button
            onClick={() => scrollTo('hero')}
            className="flex items-center gap-3 text-left focus-visible:outline-none"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-border/80 bg-muted">
              <Image
                src="/icon.png"
                alt="Dormitory System Logo"
                fill
                sizes="36px"
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-foreground block">
                Dormitory System
              </span>
              <span className="text-[11px] font-medium text-muted-foreground block -mt-0.5">

              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <button
              onClick={() => scrollTo('amenities')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Amenities
            </button>
            <button
              onClick={() => scrollTo('rooms')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Rooms
            </button>
            <button
              onClick={() => scrollTo('gallery')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/dormitory.apk" download="dormitory.apk">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-4 font-semibold border-border hover:bg-muted"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-foreground" />
                Download App
              </Button>
            </a>
            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                className="rounded-full px-5 font-semibold shadow-xs"
              >
                Log In
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background/95 backdrop-blur-md px-6 py-5 md:hidden space-y-4">
            <div className="flex flex-col gap-3 font-medium text-muted-foreground text-sm">
              <button
                onClick={() => scrollTo('amenities')}
                className="text-left py-1 hover:text-foreground"
              >
                Amenities
              </button>
              <button
                onClick={() => scrollTo('rooms')}
                className="text-left py-1 hover:text-foreground"
              >
                Rooms
              </button>
              <button
                onClick={() => scrollTo('gallery')}
                className="text-left py-1 hover:text-foreground"
              >
                Gallery
              </button>
              <button
                onClick={() => scrollTo('contact')}
                className="text-left py-1 hover:text-foreground"
              >
                Contact
              </button>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <a href="/dormitory.apk" download="dormitory.apk" className="w-full">
                <Button variant="outline" className="w-full rounded-full font-semibold">
                  <Download className="mr-2 h-4 w-4" />
                  Download Mobile App (.APK)
                </Button>
              </a>
              <Link href="/login" className="block w-full">
                <Button className="w-full rounded-full font-semibold">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden border-b border-border/60"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6" data-aos="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                2026 Dormitory Admissions & Reservations Open
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground leading-[1.08]">
                Safe, clean, and comfortable living for students & professionals.
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                Experience worry-free dormitory living equipped with automated QR access control,
                high-speed connectivity, verified visitor management, and dedicated quiet study spaces.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/login">
                  <Button size="lg" className="h-12 rounded-full px-8 font-semibold w-full sm:w-auto">
                    Sign In to Portal
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="/dormitory.apk" download="dormitory.apk" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full px-7 font-semibold w-full hover:bg-muted/60"
                  >
                    <Smartphone className="mr-2 h-4 w-4 text-foreground" />
                    Download Mobile App
                  </Button>
                </a>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => scrollTo('rooms')}
                  className="h-12 rounded-full px-6 w-full sm:w-auto hover:bg-muted/60"
                >
                  Explore Rooms
                </Button>
              </div>

              {/* Quick Perks */}
              <div className="pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-xs text-muted-foreground">Guard & Security Access</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">100 Mbps</div>
                  <div className="text-xs text-muted-foreground">Dedicated WiFi Zones</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">Zero</div>
                  <div className="text-xs text-muted-foreground">Hidden Utility Surprises</div>
                </div>
              </div>
            </div>

            {/* Right Showcase Image */}
            <div className="lg:col-span-5 relative" data-aos="fade-left" data-aos-delay="200">
              <div className="relative mx-auto aspect-4/5 w-full max-w-md rounded-2xl overflow-hidden border border-border shadow-2xl bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80"
                  alt="Dormitory living space showcase"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
                  <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                    Featured Residence
                  </span>
                  <h3 className="text-lg font-bold">Premium Student Quarters</h3>
                  <p className="text-xs text-white/80">
                    Designed for comfort, acoustic privacy, and peak academic focus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="bg-muted/40 py-10 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((s, idx) => (
              <div key={s.label} data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="text-3xl font-extrabold text-foreground tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase font-medium tracking-wide">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Built for Community & Safety
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need under one roof
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We ensure our residents enjoy high-standard amenities that support both academic success and relaxed personal living.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AMENITIES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  data-aos="fade-up"
                  data-aos-delay={idx * 80}
                  className="rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:border-foreground/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center text-foreground mb-5 border border-border/80">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Room Showcase Section */}
      <section id="rooms" className="py-24 bg-muted/30 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16" data-aos="fade-up">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Living Options
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mt-1">
                Choose the space that fits you
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              All room layouts include essential furnishings, high-speed WiFi, security access, and regular housekeeping.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ROOM_TYPES.map((room, idx) => (
              <div
                key={room.name}
                data-aos="fade-up"
                data-aos-delay={idx * 120}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:shadow-lg flex flex-col"
              >
                <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-foreground border border-border">
                    {room.capacity}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{room.name}</h3>
                    <p className="text-xs font-semibold text-primary mt-1">{room.price}</p>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {room.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-2">
                    {room.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-2 mb-14" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Visual Tour
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Life around our dormitory
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map((g, idx) => (
              <div
                key={g.title}
                data-aos="zoom-in"
                data-aos-delay={idx * 100}
                className="group relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-muted shadow-xs"
              >
                <img
                  src={g.url}
                  alt={g.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70 block">
                    {g.category}
                  </span>
                  <span className="text-sm font-bold block">{g.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-muted/40 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5" data-aos="fade-right">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Get In Touch
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Visit or inquire with our administration
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Have questions regarding room reservations, dormitory rules, or monthly rates? Reach out to us or visit our admin desk.
              </p>

              <div className="pt-4 space-y-4 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-foreground border border-border">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Location</div>
                    <div>124 University Avenue, Campus District</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-foreground border border-border">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Front Desk Contact</div>
                    <div>+63 (912) 345-6789 / (083) 228-1020</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-foreground border border-border">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Email Address</div>
                    <div>admissions@dormitory-system.edu.ph</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-foreground border border-border">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Office Hours</div>
                    <div>Mon – Sat: 8:00 AM – 6:00 PM (Guard 24/7)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquire Card */}
            <div className="lg:col-span-7" data-aos="fade-left">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-xs">
                <h3 className="text-xl font-bold text-foreground">Resident & Admin Portal</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Already registered? Sign in to manage your room assignment, scan logs, and visitor requests.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center">
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" className="rounded-full px-8 font-semibold w-full">
                      Proceed to Log In
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="/dormitory.apk" download="dormitory.apk" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="rounded-full px-6 font-semibold w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Android App
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground bg-background">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6">
              <Image src="/icon.png" alt="Logo" fill sizes="24px" className="object-contain" />
            </div>
            <span className="font-semibold text-foreground">Dormitory Management System</span>
          </div>
          <p>© {new Date().getFullYear()} Dormitory Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}