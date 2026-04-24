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

const Home = () => {
  return (
    <div className="bg-black min-h-screen selection:bg-brand/30 selection:text-brand">
      <Navbar />
      <main>
        <Hero />
        <CompanyMarquee />
        <FeaturedCourse />
        <StudentTestimonials />
        <YoutubeShowcase />
        <HorizontalScroll />
        <Community />
        <ComparisonSection />
        <FaqSection />
        <TransformJourney />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
