import React, { memo } from 'react';
import { useHomeImages } from '../hooks/useHomeImages';
import ServicesSection from '../components/home/ServicesSection';
import WhyChooseUsSection from '../components/home/WhyChooseUsSection';
import MentorshipsSection from '../components/home/MentorshipsSection';
import AboutSection from '../components/home/AboutSection';
import { ABOUT_IMAGES, ABOUT_STATS, dummyBlogs } from '../utils/constants';
import Blog from '../components/home/Blog';
import Testimonials from '../components/home/Testimonials';
import ContactUsSection from '../components/home/ContactUsSection';
import FooterSection from '../components/home/FooterSection';
import HeroSection from '../components/home/HeroSection';


const Home: React.FC = () => {
  const img = useHomeImages();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero - Critical for LCP */}
      <HeroSection img={img} />

      {/* Services section */}
      <section id="services">
        <ServicesSection />
      </section>

      {/* why choose us section */}
      <section id="why-us">
        <WhyChooseUsSection />
      </section>

      {/* Mentorships section */}
      <section id="mentorships">
        <MentorshipsSection />
      </section>

      {/* About section */}
      <section id="about">
        <AboutSection images={ABOUT_IMAGES} stats={[...ABOUT_STATS]} />
      </section>


      {/* Blog section */}
      <section id="blogs">
        <Blog dummyBlogs={dummyBlogs}/>
      </section>

      {/* Testimonials section */}
      <section id="testimonials">
        <Testimonials />
      </section>

      {/* ContactUs section */}
      <section id="contactUs">
        <ContactUsSection />
      </section>

      {/* FooterSection section */}
      <section id="footerSection" className="mt-20">
        <FooterSection />
      </section>
    </div>
  );
};

export default memo(Home);