import { useEffect, useState } from "react";
import { AlertTriangle, Download, HardDriveDownload, History, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { downloadAcademyBackup, exportAcademy, importAcademy, listBackups, restoreBackup } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { fieldLabel, panel } from "./common";

/** Sauvegarde du travail de Jana : export, restauration, copies du jour. */
export default function ParentBackup() {
  const [backups, setBackups] = useState(() => listBackups());
  const [texte, setTexte] = useState("");

  useEffect(() => {
    const onFull = () =>
      toast.error("Le stockage du navigateur est plein : supprime un gros dessin ou exporte une sauvegarde.", { duration: 10000 });
    window.addEventListener("academie:storage-full", onFull);
    return () => window.removeEventListener("academie:storage-full", onFull);
  }, []);

  const refresh = () => setBackups(listBackups());

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={panel}>
        <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-[#86EFAC]">
          <ShieldCheck className="size-5" /> Sauvegarder
        </h2>
        <p className="mt-2 text-sm text-[#C7D2FE]">
          Le travail de Jana (progression, créations, dictées, livres ajoutés) est enregistré dans ce navigateur.
          Une copie de sécurité est faite <strong>chaque jour</strong> automatiquement. Pour ne rien perdre, télécharge
          aussi une sauvegarde de temps en temps et garde le fichier.
        </p>
        <Button className="mt-4" onClick={() => { downloadAcademyBackup(); toast.success("Sauvegarde téléchargée"); }} data-testid="backup-download">
          <Download /> Télécharger une sauvegarde
        </Button>

        <label className={fieldLabel + " mt-6"}>Ou copier la sauvegarde en texte</label>
        <textarea
          readOnly
          rows={3}
          value={texte || "Clique sur « Afficher le texte » pour voir la sauvegarde."}
          onFocus={() => setTexte(exportAcademy())}
          className="w-full rounded-xl border border-white/10 bg-[#0B1420] p-2 text-[11px] text-[#8FA3BF]"
          data-testid="backup-text"
        />
        <Button variant="ghost" size="sm" className="mt-2 text-[#86EFAC]" onClick={() => { setTexte(exportAcademy()); navigator.clipboard?.writeText(exportAcademy()); toast.success("Sauvegarde copiée"); }}>
          Copier dans le presse-papiers
        </Button>
      </div>

      <div className={panel}>
        <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-[#FDE68A]">
          <HardDriveDownload className="size-5" /> Restaurer
        </h2>
        <p className="mt-2 text-sm text-[#C7D2FE]">
          Choisis un fichier de sauvegarde exporté plus tôt. L'état actuel est conservé de côté avant d'être remplacé.
        </p>
        <label className="mt-4 block">
          <input
            type="file"
            accept="application/json,.json"
            className="block w-full text-sm text-[#C7D2FE] file:mr-3 file:rounded-lg file:border-0 file:bg-[#38BDF8]/20 file:px-3 file:py-2 file:text-sm file:text-[#86EFAC]"
            data-testid="backup-file"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              if (importAcademy(text)) {
                toast.success("Sauvegarde restaurée");
                setTimeout(() => window.location.reload(), 600);
              } else {
                toast.error("Ce fichier n'est pas une sauvegarde de l'Académie.");
              }
            }}
          />
        </label>

        <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#86EFAC]">
          <History className="size-4" /> Copies automatiques
        </h3>
        {backups.length === 0 ? (
          <p className="mt-2 text-xs text-[#93A4C4]">Aucune copie pour l'instant : elle se crée à la première modification du jour.</p>
        ) : (
          <ul className="mt-2 space-y-1" data-testid="backup-list">
            {backups.map((b) => (
              <li key={b.key} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm text-[#C7D2FE]">
                <span>{b.date.split("-").reverse().join("/")}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[#86EFAC]"
                  data-testid={`backup-restore-${b.date}`}
                  onClick={() => {
                    if (!window.confirm(`Revenir au travail du ${b.date.split("-").reverse().join("/")} ? L'état actuel est conservé de côté.`)) return;
                    if (restoreBackup(b.key)) {
                      toast.success("Journée restaurée");
                      setTimeout(() => window.location.reload(), 600);
                    } else {
                      toast.error("Copie illisible.");
                    }
                  }}
                >
                  <Upload className="size-3.5" /> Restaurer
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button variant="ghost" size="sm" className="mt-2 text-[#A7A1C8]" onClick={refresh}>Actualiser la liste</Button>

        <p className="mt-6 flex gap-2 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-3 text-xs leading-relaxed text-[#FDE68A]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          Effacer les données du navigateur (ou naviguer en mode privé) supprime le travail de Jana. Le fichier de
          sauvegarde est le seul moyen de le récupérer.
        </p>
      </div>
    </div>
  );
}
