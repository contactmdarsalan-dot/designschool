import Navbar from '../components/sheryians/Navbar';
import Hero from '../components/sheryians/Hero';
import CompanyMarquee from '../components/sheryians/CompanyMarquee';
import FeaturedCourse from '../components/sheryians/FeaturedCourse';
import StudentTestimonials from '../components/sheryians/StudentTestimonials';
import YoutubeShowcase from '../components/sheryians/YoutubeShowcase';
import HorizontalScroll from '../components/sheryians/HorizontalScroll';
import Community from '../components/sheryians/Community';
import ComparisonSection from '../components/sheryians/ComparisonSection';
import FaqSection from '../components/sheryians/FaqSection';
import TransformJourney from '../components/sheryians/TransformJourney';
import Footer from '../components/sheryians/Footer';
import useSectionReveal from '../hooks/useSectionReveal';

const Home = () => {
  const pageRef = useSectionReveal();

  return (
    <div className="bg-black min-h-screen selection:bg-brand/30 selection:text-brand">
      <Navbar />
      <main ref={pageRef}>
        <section data-gsap-section data-motion="hero">
          <div data-gsap-item>
            <Hero />
          </div>
        </section>
        <section data-gsap-section data-motion="zoom">
          <div data-gsap-item data-gsap-media>
            <HorizontalScroll />
          </div>
        </section>
        <section data-gsap-section data-motion="up">
          <div data-gsap-item>
            <CompanyMarquee />
          </div>
        </section>
        <section data-gsap-section data-motion="left">
          <div data-gsap-item>
            <FeaturedCourse />
          </div>
        </section>
        <section data-gsap-section data-motion="right">
          <div data-gsap-item>
            <StudentTestimonials />
          </div>
        </section>
        <section data-gsap-section data-motion="up">
          <div data-gsap-item>
            <YoutubeShowcase />
          </div>
        </section>
        <section data-gsap-section data-motion="left">
          <div data-gsap-item>
            <Community />
          </div>
        </section>
        <section data-gsap-section data-motion="right">
          <div data-gsap-item>
            <ComparisonSection />
          </div>
        </section>
        <section data-gsap-section data-motion="up">
          <div data-gsap-item>
            <FaqSection />
          </div>
        </section>
        <section data-gsap-section data-motion="hero">
          <div data-gsap-item>
            <TransformJourney />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
