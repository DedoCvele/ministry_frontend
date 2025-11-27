import { HeaderAlt } from '../components/HeaderAlt';
import { HeroSectionAlt } from '../components/HeroSectionAlt';
import { VintageBanner } from '../components/VintageBanner';
import { ShopTheFinds } from '../components/ShopTheFinds';
import { BecomeSellerSection } from '../components/BecomeSellerSection';
import { JournalSpread } from '../components/JournalSpread';
import { FooterAlt } from '../components/FooterAlt';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAccountClick = () => {
    navigate(user ? '/profile' : '/login');
  };
  
  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      <HeaderAlt 
        language="en"
        onAccountClick={handleAccountClick}
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