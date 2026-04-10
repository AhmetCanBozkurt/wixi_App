import React from 'react';
import { Header } from '../components/header';
import { Hero } from '../components/hero';
import { About } from '../components/about';
import { Products } from '../components/products';
import { Projects } from '../components/projects';
import { Contact } from '../components/contact';
import { Footer } from '../components/footer';
import { WhatsAppButton } from '../components/whatsapp-button';

export default function TekstilHome() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Products />
      <Projects />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}

