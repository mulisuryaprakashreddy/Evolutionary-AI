import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import Landing from "./pages/Landing.jsx";

const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard.jsx"));
const StudentView = lazy(() => import("./pages/StudentView.jsx"));

function Fallback() {
  return (
    <div className="grid min-h-screen place-items-center">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-brand-400" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room/:roomId" element={<RoomRouter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

// The same route serves both teacher and student views. The ?role=teacher
// query param selects the dashboard; everything else is the student view.
function RoomRouter() {
  const [params] = useSearchParams();
  return params.get("role") === "teacher" ? <TeacherDashboard /> : <StudentView />;
}
