import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { translationService } from '@/lib/i18n/translation-service';

export function AutoTranslateProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const currentLang = translationService.getCurrentLanguage();
    if (currentLang === 'en') return;

    const translatedNodes = new Set<Node>();
    let translationQueue: Array<{ node: Node; text: string }> = [];
    let isProcessing = false;

    const processQueue = async () => {
      if (isProcessing || translationQueue.length === 0) return;
      isProcessing = true;
      const batch = translationQueue.splice(0, 5);

      for (const { node, text } of batch) {
        try {
          const translated = await translationService.translateText(text, currentLang, 'en');
          if (node.textContent !== translated && !translatedNodes.has(node)) {
            node.textContent = translated;
            translatedNodes.add(node);
          }
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      isProcessing = false;
      if (translationQueue.length > 0) setTimeout(processQueue, 200);
    };

    const collectTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text && text.length > 0 && text.length < 500 && !translatedNodes.has(node)) {
          translationQueue.push({ node, text });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'SVG', 'INPUT', 'TEXTAREA'].includes(element.tagName)) return;
        if (element.hasAttribute('data-no-translate')) return;
        for (const child of Array.from(element.childNodes)) {
          collectTextNodes(child);
        }
      }
    };

    observerRef.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          collectTextNodes(node);
        }
      }
      if (translationQueue.length > 0 && !isProcessing) processQueue();
    });

    const timer = setTimeout(() => {
      const body = document.body;
      if (body) {
        collectTextNodes(body);
        processQueue();
        observerRef.current?.observe(body, { childList: true, subtree: true });
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
      translationQueue = [];
      translatedNodes.clear();
    };
  }, [location.pathname]);

  return <>{children}</>;
}
