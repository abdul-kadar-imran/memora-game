import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import Footer from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { MemoraProvider } from './hooks/useMemoraStore';
import { useRouter } from './hooks/useRouter';
import { DashboardPage } from './pages/DashboardPage';
import { GameArenaPage } from './pages/GameArenaPage';

function MemoraShell() {
  const { route, navigate } = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F7FF] text-[#20213A] dark:bg-[#090B18] dark:text-[#F5F5FF] flex flex-col transition-colors duration-200">
      <Navbar currentRoute={route} onNavigate={navigate} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {route === '/dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DashboardPage onNavigate={navigate} />
            </motion.div>
          ) : (
            <motion.div
              key="arena"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <GameArenaPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <MemoraProvider>
        <MemoraShell />
      </MemoraProvider>
    </MotionConfig>
  );
}
