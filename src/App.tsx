import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { getState } from './data/store';
import OnboardingPage from './routes/onboarding/OnboardingPage';
import AppShell from './routes/app/AppShell';
import PulsePage from './routes/app/pulse/PulsePage';
import GatherPage from './routes/app/gather/GatherPage';
import CreatePage from './routes/app/create/CreatePage';
import PinDetailPage from './routes/app/pin/PinDetailPage';
import CollagePage from './routes/app/collage/CollagePage';
import BuildingPage from './routes/app/building/BuildingPage';
import ProfilePage from './routes/app/profile/ProfilePage';
import WhatsAppPage from './routes/whatsapp/WhatsAppPage';
import BusinessPage from './routes/business/BusinessPage';
import BusinessHomePage from './routes/business/BusinessHomePage';
import BusinessPostPage from './routes/business/BusinessPostPage';
import BusinessStatsPage from './routes/business/BusinessStatsPage';
import GovPage from './routes/gov/GovPage';
import AdminPage from './routes/admin/AdminPage';
import ConsolePage from './routes/console/ConsolePage';
import KitchenSinkPage from './routes/kitchen-sink/KitchenSinkPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect — first-run users go through onboarding, returning
            users land in Pulse (PRS section 6 IA). */}
        <Route
          path="/"
          element={
            <Navigate to={getState().onboardingDone ? '/app/pulse' : '/onboarding'} replace />
          }
        />

        {/* Onboarding */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Resident app shell */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="/app/pulse" replace />} />
          <Route path="pulse" element={<PulsePage />} />
          <Route path="gather" element={<GatherPage />} />
          <Route path="create" element={<CreatePage />} />
          <Route path="pin/:id" element={<PinDetailPage />} />
          <Route path="collage/:groupId" element={<CollagePage />} />
          <Route path="building" element={<BuildingPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* WhatsApp VIPIN imitation */}
        <Route path="/whatsapp" element={<WhatsAppPage />} />

        {/* Business dashboard */}
        <Route path="/business" element={<BusinessPage />}>
          <Route index element={<BusinessHomePage />} />
          <Route path="post" element={<BusinessPostPage />} />
          <Route path="stats" element={<BusinessStatsPage />} />
        </Route>

        {/* Government vision dashboard */}
        <Route path="/gov" element={<GovPage />} />

        {/* Admin moderation */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Hidden Test Console — not in resident navigation */}
        <Route path="/console" element={<ConsolePage />} />

        {/* Temporary kitchen sink — Phase 1 acceptance check only */}
        <Route path="/kitchen-sink" element={<KitchenSinkPage />} />
      </Routes>
    </BrowserRouter>
  );
}
