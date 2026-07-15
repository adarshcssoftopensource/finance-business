import PayAsBank from '../components/app/PayAsBank';
import PayAsBankErrorBoundary from '../components/app/PayAsBank/ErrorBoundary';

const protectedRoutes = [
  // ... existing routes ...
  {
    path: '/pay-as-bank',
    element: (
      <PayAsBankErrorBoundary>
        <PayAsBank />
      </PayAsBankErrorBoundary>
    ),
  },
]; 