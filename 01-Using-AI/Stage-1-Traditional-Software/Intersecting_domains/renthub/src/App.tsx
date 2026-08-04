import { StoreProvider, useStore } from './store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toasts } from './components/Toasts';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ListingPage } from './pages/ListingPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { WishlistPage } from './pages/WishlistPage';
import { DashboardPage } from './pages/DashboardPage';

function Router() {
  const { route } = useStore();
  switch (route.name) {
    case 'home': return <HomePage />;
    case 'browse': return <BrowsePage />;
    case 'listing': return <ListingPage />;
    case 'cart': return <CartPage />;
    case 'checkout': return <CheckoutPage />;
    case 'confirmation': return <ConfirmationPage />;
    case 'wishlist': return <WishlistPage />;
    case 'dashboard': return <DashboardPage />;
    default: return <HomePage />;
  }
}

export default function App() {
  return (
    <StoreProvider>
      <div className="flex min-h-screen flex-col bg-bg">
        <Header />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
        <Toasts />
      </div>
    </StoreProvider>
  );
}
