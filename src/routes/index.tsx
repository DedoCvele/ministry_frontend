import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../components/ShopPage';
import { ClosetsPage } from '../components/ClosetsPage';
import { JournalHomepage } from '../components/JournalHomepage';
import { ArticleDetail } from '../components/ArticleDetail';
import { ProfilePage } from '../components/ProfilePage';
import { UploadItem } from '../components/UploadItem';
import { ProductPage } from '../components/ProductPage';
import { CartPage } from '../components/CartPage';
import { CheckoutPage } from '../components/CheckoutPage';
import { PaymentProcessing } from '../components/PaymentProcessing';
import { NewOrderConfirmation } from '../components/NewOrderConfirmation';
import { BecomeSellerOnboarding } from '../components/BecomeSellerOnboarding';
import ClosetPage from '../components/ClosetPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: 'index',
        element: <HomePage />,
      },
      {
        path: 'shop',
        element: <ShopPage language="en" />,
      },
      {
        path: 'closets',
        children: [
          {
            index: true,
            element: <ClosetsPage language="en" />,
          },
          {
            path: ':closetId',
            element: <ClosetPage language="en" />,
          },
        ],
      },
      {
        path: 'closet',
        element: <ClosetsPage language="en" />,
      },
      {
        path: 'blog',
        children: [
          {
            index: true,
            element: <JournalHomepage language="en" />,
          },
          {
            path: ':articleId',
            element: <ArticleDetail language="en" />,
          },
        ],
      },
      {
        path: 'profile',
        children: [
          {
            index: true,
            element: <ProfilePage language="en" />,
          },
          {
            path: 'upload',
            element: <UploadItem language="en" onClose={() => '/profile'} />,
          },
        ],
      },
      {
        path: 'product/:productId',
        element: <ProductPage onBack={() => '/'} onCheckout={() => '/cart'} />,
      },
      {
        path: 'cart',
        element: <CartPage language="en" items={[]} onRemoveItem={() => {}} onCheckout={() => '/checkout'} onContinueShopping={() => '/shop'} onBack={() => '/shop'} />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage language="en" items={[]} onBack={() => '/cart'} onCompletePayment={() => '/payment-processing'} />,
      },
      {
        path: 'payment-processing',
        element: <PaymentProcessing onComplete={() => '/order-confirmation'} />,
      },
      {
        path: 'order-confirmation',
        element: <NewOrderConfirmation language="en" orderNumber="MOS-2024-0012" onContinueShopping={() => '/shop'} />,
      },
      {
        path: 'become-seller',
        element: <BecomeSellerOnboarding language="en" onClose={() => '/'} onSuccess={() => '/profile'} />,
      },
    ],
  },
]);
