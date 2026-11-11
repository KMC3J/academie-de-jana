import {
  BookOpen, Calculator, Compass, Crown, Feather, FlaskConical, Flame, Globe, Landmark, Languages, Leaf, Moon,
  Music, Palette, PenTool, Sparkles, Star, Trophy, WandSparkles, Cat, Bird, Rabbit, Gem, Flower2,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  book: BookOpen, calculator: Calculator, compass: Compass, crown: Crown, feather: Feather, flask: FlaskConical,
  flame: Flame, globe: Globe, landmark: Landmark, languages: Languages, leaf: Leaf, moon: Moon, music: Music,
  palette: Palette, pen: PenTool, sparkles: Sparkles, star: Star, trophy: Trophy, wand: WandSparkles, cat: Cat,
  bird: Bird, rabbit: Rabbit, gem: Gem, flower: Flower2,
};

export const SUBJECT_ICON_NAMES = [
  "book", "calculator", "feather", "flask", "globe", "landmark", "languages", "leaf", "music", "palette", "pen", "compass",
];
export const AVATAR_ICON_NAMES = ["wand", "cat", "bird", "rabbit", "moon", "star", "crown", "gem", "flower", "sparkles"];
export const AVATAR_COLORS = ["#8B5CF6", "#F59E0B", "#06B6D4", "#10B981", "#EC4899", "#E11D48", "#FB923C"];

export function MagicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} />;
}

export function AvatarBadge({
  icon, color, size = 48, testId,
}: { icon: string; color: string; size?: number; testId?: string }) {
  return (
    <span
      data-testid={testId}
      className="inline-flex shrink-0 items-center justify-center rounded-full ring-2 ring-[#F59E0B]/60"
      style={{
        width: size, height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}, #18142A 90%)`,
        boxShadow: `0 0 18px ${color}66`,
      }}
    >
      <MagicIcon name={icon} className="text-white" />
    </span>
  );
}
