import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { AppProvider, useApp } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CinematicIntro } from './components/intro/CinematicIntro';
import { LandingPage } from './components/landing/LandingPage';
import { AuthScreen } from './components/auth/AuthScreen';
import { PendingApprovalScreen } from './components/auth/PendingApprovalScreen';
import { FounderSetupView } from './components/admin/FounderSetupView';
import { WorkspaceShell } from './components/layout/WorkspaceShell';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { AiDoctorModule } from './components/modules/AiDoctorModule';
import { DiagnosisModule } from './components/modules/DiagnosisModule';
import { LabAnalyzerModule } from './components/modules/LabAnalyzerModule';
import { RadiologyModule } from './components/modules/RadiologyModule';
import { EchoTrainingModule } from './components/modules/EchoTrainingModule';
import { MedicalImagesModule } from './components/modules/MedicalImagesModule';
import { PharmaModule } from './components/modules/PharmaModule';
import { MedSchoolModule } from './components/modules/MedSchoolModule';
import { ClinicModule } from './components/modules/ClinicModule';
import { HealthModule } from './components/modules/HealthModule';
import { ClinicalModule } from './components/modules/ClinicalModule';
import { ReferralModule } from './components/referrals/ReferralModule';
import { WalletProModule } from './components/wallet/WalletProModule';
import { FounderAdminConsole } from './components/admin/FounderAdminConsole';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { db } from './lib/firebase';

function ModuleViewport() {
  const { activeModule, isGuest, isFounder, language, reducedMotion } = useApp();

  // Log anonymous non-PII guest module exploration when in Guest Mode
  useEffect(() => {
    if (!isGuest) return;
    let sid = window.sessionStorage.getItem('mamo_guest_sid');
    if (!sid) {
      sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      window.sessionStorage.setItem('mamo_guest_sid', sid);
    }
    const eventId = `${sid}_${activeModule}_${Date.now()}`;
    setDoc(doc(db, 'guest_analytics', eventId), {
      sessionId: sid,
      moduleVisited: activeModule,
      language,
      createdAt: serverTimestamp()
    }).catch(() => {});
  }, [activeModule, isGuest, language]);

  const renderModule = () => {
    switch (activeModule) {
      case 'ai-doctor':
        return <AiDoctorModule />;
      case 'diagnosis':
        return <DiagnosisModule />;
      case 'lab-analyzer':
        return <LabAnalyzerModule />;
      case 'radiology':
        return <RadiologyModule />;
      case 'echo-training':
        return <EchoTrainingModule />;
      case 'medical-images':
        return <MedicalImagesModule />;
      case 'pharma':
        return <PharmaModule />;
      case 'med-school':
        return <MedSchoolModule />;
      case 'clinic':
        return <ClinicModule />;
      case 'health':
        return <HealthModule />;
      case 'clinical':
        return <ClinicalModule />;
      case 'referrals':
        return <ReferralModule />;
      case 'wallet':
        return <WalletProModule />;
      case 'admin':
        return isFounder ? <FounderAdminConsole /> : <AiDoctorModule />;
      case 'dashboard':
        return isFounder ? <DashboardHome /> : <AiDoctorModule />;
      default:
        return isFounder ? <DashboardHome /> : <AiDoctorModule />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeModule}
        initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {renderModule()}
      </motion.div>
    </AnimatePresence>
  );
}

function RootRouter() {
  const { view, user, isGuest, isFounder, approvalStatus, authLoading } = useApp();

  if (view === 'intro') {
    return <CinematicIntro />;
  }
  if (view === 'landing') {
    return <LandingPage />;
  }
  if (view === 'auth') {
    return <AuthScreen />;
  }
  if (view === 'founder-setup') {
    return <FounderSetupView />;
  }

  // Enforce Founder Admin approval gate for non-founder signed-in users
  if (!isGuest && user && !authLoading && !isFounder && approvalStatus !== 'approved') {
    return <PendingApprovalScreen />;
  }

  return (
    <WorkspaceShell>
      <ModuleViewport />
    </WorkspaceShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <RootRouter />
        <OfflineIndicator />
      </AppProvider>
    </ErrorBoundary>
  );
}
