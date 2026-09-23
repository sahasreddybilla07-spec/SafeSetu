import { useEffect, useRef, useState } from 'react';
import { Globe2, Move } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageSelector() {
  const { language, languages, setLanguage, t } = useLanguage();
  const selectorRef = useRef(null);
  const dragRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragRef.current || !selectorRef.current) return;

      const { offsetX, offsetY } = dragRef.current;
      const { offsetWidth, offsetHeight } = selectorRef.current;
      const maxLeft = Math.max(0, window.innerWidth - offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - offsetHeight);

      setPosition({
        left: Math.min(Math.max(0, event.clientX - offsetX), maxLeft),
        top: Math.min(Math.max(0, event.clientY - offsetY), maxTop),
      });
    };

    const handlePointerUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handleDragStart = (event) => {
    const bounds = selectorRef.current.getBoundingClientRect();
    dragRef.current = {
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    };
    setPosition({ left: bounds.left, top: bounds.top });
    setIsDragging(true);
    event.preventDefault();
  };

  const positionStyle = position ? { left: position.left, top: position.top, bottom: 'auto' } : undefined;

  return (
    <label className={`language-selector${isDragging ? ' language-selector--dragging' : ''}`} ref={selectorRef} style={positionStyle}>
      <button
        aria-label="Move language selector"
        className="language-selector__handle"
        onPointerDown={handleDragStart}
        title="Move language selector"
        type="button"
      >
        <Move aria-hidden="true" size={12} />
      </button>
      <Globe2 aria-hidden="true" size={15} />
      <span className="language-selector__label">{t('Select language')}</span>
      <select aria-label={t('Select language')} onChange={(event) => setLanguage(event.target.value)} value={language}>
        {languages.map((item) => (
          <option key={item.code} value={item.code}>{item.nativeLabel}</option>
        ))}
      </select>
    </label>
  );
}
