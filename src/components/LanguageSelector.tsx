import React from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { translationService } from '@/lib/i18n/translation-service';

export function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = React.useState(
    translationService.getCurrentLanguage()
  );
  const languages = translationService.getSupportedLanguages();

  const currentLangData = languages.find(l => l.code === currentLanguage);

  const changeLanguage = (code: string) => {
    translationService.setLanguage(code);
    setCurrentLanguage(code);
  };

  const getFlagEmoji = (code: string) => {
    const map: Record<string, string> = {
      en: '🇺🇸', ar: '🇸🇦', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹',
      pt: '🇵🇹', ru: '🇷🇺', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', hi: '🇮🇳',
      ur: '🇵🇰', tr: '🇹🇷', fa: '🇮🇷', ha: '🇳🇬', sw: '🇰🇪', id: '🇮🇩',
      ms: '🇲🇾', th: '🇹🇭', vi: '🇻🇳',
    };
    return map[code] || '🌐';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5 px-2 h-9">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium">
            {currentLangData?.nativeName || 'English'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Select Language
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => changeLanguage(lang.code)}
            className="flex items-center justify-between gap-2 px-2 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{getFlagEmoji(lang.code)}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground leading-tight">{lang.name}</span>
              </div>
            </div>
            {currentLanguage === lang.code && <Check className="h-4 w-4 text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
