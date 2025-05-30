
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageSelectorProps {
  showIcon?: boolean;
  variant?: "sidebar" | "mobile" | "login";
}

export const LanguageSelector = ({ showIcon = true, variant = "sidebar" }: LanguageSelectorProps) => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { value: 'en', label: t('english'), flag: '🇺🇸' },
    { value: 'fr', label: t('french'), flag: '🇫🇷' },
    { value: 'ar', label: t('arabic'), flag: '🇸🇦' }
  ];

  if (variant === "login") {
    return (
      <div className="mb-4">
        <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fr' | 'ar')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('language')} />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-2 text-xs uppercase font-semibold text-gray-400">
          {t('language')}
        </div>
        <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fr' | 'ar')}>
          <SelectTrigger className="w-full bg-sidebar border-sidebar-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="p-2 border-t border-sidebar-border">
      <div className="mb-2 text-xs uppercase font-semibold text-gray-400">
        {t('language')}
      </div>
      <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fr' | 'ar')}>
        <SelectTrigger className="w-full bg-sidebar border-sidebar-border text-sidebar-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
