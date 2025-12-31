// import { useLocation } from 'react-router-dom';
// import Header from './Header';
// import Footer from './Footer';

// interface LayoutProps {
//   children: React.ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const location = useLocation();
  
//   // Check if the current path starts with any excluded route
//   const excludedRoutes = ['/receipt'];
//   const isExcluded = excludedRoutes.some(route => location.pathname.startsWith(route));
  
//   return (
//     <div className="flex min-h-screen flex-col">
//       {!isExcluded && <Header />}
//       <main className="flex-1">{children}</main>
//       {!isExcluded && <Footer />}
//     </div>
//   );
// };

// export default Layout;



import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Pages that should not show the footer
  const excludedRoutes = ['/dashboard', '/payments', '/history', '/receipt', '/verify-payment', '/pay', '/admin'];
  const shouldHideFooter = excludedRoutes.some(route => location.pathname.startsWith(route));
  
  return (
    <div className="flex min-h-screen flex-col">
      <div className="no-print">
        <Header />
      </div>
      <main className="flex-1">{children}</main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default Layout;
