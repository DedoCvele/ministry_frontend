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
  const { user, isAdmin } = useAuth();

  const handleAccountClick = () => {
    if (!user) {
      navigate('/login');
    } else if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
  };
  
  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      <HeaderAlt 
        onAccountClick={handleAccountClick}
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