import { lazy, Suspense, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Portal from "./components/Portal";

const PatternArcade = lazy(() => import("./games/pattern-arcade/PatternArcade"));
const LogicGrid = lazy(() => import("./games/logic-grid/LogicGrid"));
const StoryMath = lazy(() => import("./games/story-math/StoryMath"));
const TwentyQuestions = lazy(() => import("./games/twenty-questions/TwentyQuestions"));

function Loading() {
  return (
    <div className="flex items-center justify-center py-24 text-5xl animate-bob">🌱</div>
  );
}

export type Page = "home" | "portal" | "pattern" | "logic" | "story" | "twenty";

function pageFromHash(): Page {
  const h = window.location.hash.replace("#", "");
  if (["home", "portal", "pattern", "logic", "story", "twenty"].includes(h)) return h as Page;
  return "home";
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (p: Page) => {
    window.location.hash = p;
    setPage(p);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar navigate={navigate} page={page} />
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          {page === "home" && <Home navigate={navigate} />}
          {page === "portal" && <Portal />}
          {page === "pattern" && <PatternArcade onBack={() => navigate("home")} />}
          {page === "logic" && <LogicGrid onBack={() => navigate("home")} />}
          {page === "story" && <StoryMath onBack={() => navigate("home")} />}
          {page === "twenty" && <TwentyQuestions onBack={() => navigate("home")} />}
        </Suspense>
      </main>
      {(page === "home" || page === "portal") && (
        <footer className="text-center text-sm text-slate-500 py-6">
          🌱 MindSprout — 100% ad-free · zero tracking · made for curious kids
        </footer>
      )}
    </div>
  );
}
