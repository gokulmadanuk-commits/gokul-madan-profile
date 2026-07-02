import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

const Overview = lazy(() => import("./pages/Overview"));
const Ledger = lazy(() => import("./pages/Ledger"));
const Lifestyle = lazy(() => import("./pages/Lifestyle"));
const Methods = lazy(() => import("./pages/Methods"));
const Tracing = lazy(() => import("./pages/Tracing"));
const Separate = lazy(() => import("./pages/Separate"));
const Documents = lazy(() => import("./pages/Documents"));

/** Quiet fade while a section's working papers load — no spinner, no shimmer. */
function QuietFallback() {
  return (
    <div className="animate-fade py-24" aria-label="Loading section">
      <div className="rule-hairline w-24" />
      <p className="marginalia mt-4">Retrieving working papers&hellip;</p>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<QuietFallback />}>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/lifestyle" element={<Lifestyle />} />
          <Route path="/methods" element={<Methods />} />
          <Route path="/tracing" element={<Tracing />} />
          <Route path="/separate" element={<Separate />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="*" element={<Overview />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
