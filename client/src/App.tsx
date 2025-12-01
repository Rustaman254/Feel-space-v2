import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from '@/hooks/use-web3';
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Game from "@/pages/Game";
import GamesPage from "@/pages/Games";
import HistoryPage from "@/pages/History";
import GameSessionsPage from "@/pages/GameSessions";
import { Layout } from "@/components/layout/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/games" component={GamesPage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/sessions" component={GameSessionsPage} />
        <Route path="/game/:type" component={Game} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Web3Provider>
          <Router />
        </Web3Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
