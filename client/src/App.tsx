import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from '@/hooks/use-web3';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Game from "@/pages/Game";
import GamesPage from "@/pages/Games";
import HistoryPage from "@/pages/History";
import GameSessionsPage from "@/pages/GameSessions";
import Community from "@/pages/Community";
import InsightsPage from "@/pages/Insights";
import { Layout } from "@/components/layout/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/games" component={GamesPage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/insights" component={InsightsPage} />
        <Route path="/sessions" component={GameSessionsPage} />
        <Route path="/community" component={Community} />
        <Route path="/game/:type" component={Game} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Web3Provider>
        <TutorialProvider>
          <Router />
          <TutorialOverlay />
          <Toaster />
        </TutorialProvider>
      </Web3Provider>
    </TooltipProvider>
  );
}

export default App;
