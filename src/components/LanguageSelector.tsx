import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const { languages } = useCommerce();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) ?? languages[0];

  const getFlagEmoji = (languageCode: string) => {
    const countryCode = languageCode.split('-')[0].toUpperCase();
    switch (countryCode) {
      case 'EN': return '🇺🇸';
      case 'FR': return '🇫🇷';
      case 'ES': return '🇪🇸';
      case 'DE': return '🇩🇪';
      case 'ZH': return '🇨🇳';
      case 'AR': return '🇸🇦';
      case 'HI': return '🇮🇳';
      case 'PT': return '🇵🇹';
      case 'RU': return '🇷🇺';
      case 'JA': return '🇯🇵';
      case 'BN': return '🇧🇩';
      case 'PA': return '🇮🇳';
      case 'JV': return '🇮🇩';
      default: return '🌐';
    }
  };

  if (!languages || languages.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span>{getFlagEmoji(currentLanguage.code)}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onSelect={() => changeLanguage(language.code)}
            className="flex items-center justify-between"
          >
            <span>{getFlagEmoji(language.code)} {language.name}</span>
            {i18n.language === language.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
