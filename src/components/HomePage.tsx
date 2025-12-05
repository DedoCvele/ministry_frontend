import { HeaderAlt } from './HeaderAlt';
import { HeroSectionAlt } from './HeroSectionAlt';
import { VintageBanner } from './VintageBanner';
import { ShopTheFinds } from './ShopTheFinds';
import { BecomeSellerSection } from './BecomeSellerSection';
import { JournalSpread } from './JournalSpread';
import { FooterAlt } from './FooterAlt';
import { useNavigate } from 'react-router-dom';
import './styles/HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="home-page-root">
      <HeaderAlt 
        onShopClick={() => navigate('/shop')}
        onClosetsClick={() => navigate('/closets')}
        onJournalClick={() => navigate('/blog')}
        onBecomeSellerClick={() => navigate('/become-seller')}
      />
      
      {/* Hero Section */}
      <HeroSectionAlt />
      
      {/* Vintage Banner */}
      <VintageBanner />
      
      {/* Shop The Finds */}
      <ShopTheFinds />
      
      {/* Become Seller Section */}
      <BecomeSellerSection />
      
      {/* Journal Spread */}
      <JournalSpread />
      
      {/* Footer */}
      <FooterAlt />
    </div>
  );
}