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
        language="en"
        onShopClick={() => navigate('/shop')}
        onClosetsClick={() => navigate('/closets')}
        onJournalClick={() => navigate('/blog')}
        onBecomeSellerClick={() => navigate('/become-seller')}
      />
      
      {/* Hero Section */}
      <HeroSectionAlt language="en" />
      
      {/* Vintage Banner */}
      <VintageBanner language="en" />
      
      {/* Shop The Finds */}
      <ShopTheFinds language="en" />
      
      {/* Become Seller Section */}
      <BecomeSellerSection language="en" />
      
      {/* Journal Spread */}
      <JournalSpread language="en" />
      
      {/* Footer */}
      <FooterAlt language="en" />
    </div>
  );
}