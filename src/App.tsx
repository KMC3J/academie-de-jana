import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Shell from "@/components/Shell";
import ProfilePicker from "@/pages/ProfilePicker";
import Accueil from "@/pages/Accueil";
import Matieres from "@/pages/Matieres";
import MatiereDetail from "@/pages/MatiereDetail";
import Quiz from "@/pages/Quiz";
import Quetes from "@/pages/Quetes";
import Profil from "@/pages/Profil";
import Professeur from "@/pages/Professeur";
import Fiches from "@/pages/Fiches";
import Atelier from "@/pages/Atelier";
import Calculatrice from "@/pages/Calculatrice";
import EmploiDuTemps from "@/pages/EmploiDuTemps";
import TempsEcran from "@/pages/TempsEcran";
import Parent from "@/pages/Parent";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ProfilePicker />} />
        <Route path="/parent" element={<Parent />} />
        <Route element={<Shell />}>
          <Route path="/accueil" element={<Accueil />} />
          <Route path="/matieres" element={<Matieres />} />
          <Route path="/matieres/:id" element={<MatiereDetail />} />
          <Route path="/quiz/:subjectId/:chapterId" element={<Quiz />} />
          <Route path="/quetes" element={<Quetes />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/professeur" element={<Professeur />} />
          <Route path="/fiches" element={<Fiches />} />
          <Route path="/atelier" element={<Atelier />} />
          <Route path="/calculatrice" element={<Calculatrice />} />
          <Route path="/emploi-du-temps" element={<EmploiDuTemps />} />
          <Route path="/temps-ecran" element={<TempsEcran />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors />
    </>
  );
}
