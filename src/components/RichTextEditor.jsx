import { useRef, useEffect, useCallback } from 'react';
import './RichTextEditor.css';

const COLORS = [
  // Whites & grays
  '#ffffff','#f8f9fa','#dee2e6','#adb5bd','#6c757d','#495057','#343a40','#212529','#000000',
  // Reds & pinks
  '#e63946','#ff6b6b','#f03e3e','#c92a2a','#ff8787','#ffa8a8','#ffc9c9','#ffe3e3',
  // Oranges
  '#f97316','#fd7e14','#e8590c','#d9480f','#ffa94d','#ffc078','#ffd8a8','#fff3bf',
  // Yellows
  '#ffd60a','#fab005','#f59f00','#e67700','#ffec99','#ffe066','#ffd43b','#fcc419',
  // Greens
  '#2d6a4f','#2f9e44','#37b24d','#40c057','#51cf66','#69db7c','#8ce99a','#b2f2bb',
  // Blues
  '#4361ee','#1971c2','#1c7ed6','#339af0','#4dabf7','#74c0fc','#a5d8ff','#d0ebff',
  // Purples
  '#7b2d8b','#9c36b5','#ae3ec9','#cc5de8','#da77f2','#e599f7','#eebefa','#f3d9fa',
  // Cyans
  '#4cc9f0','#0c8599','#0b7285','#15aabf','#22b8cf','#3bc9db','#66d9e8','#99e9f2',
];

const HIGHLIGHT_COLORS = [
  '#ffd60a','#f97316','#e63946','#4cc9f0','#2d6a4f','#7b2d8b',
  '#ff8787','#ffa94d','#69db7c','#74c0fc','#da77f2','#ffffff',
];

const FONT_SIZES = ['12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];

const FONTS = [
  { label: 'Default', value: 'Inter, sans-serif' },
  { label: 'Barlow Condensed', value: "'Barlow Condensed', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
];

function Btn({ cmd, arg, title, children, onAction }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (onAction) { onAction(); return; }
    document.execCommand(cmd, false, arg || null);
  };
  return (
    <button type="button" onMouseDown={handleClick} title={title} className="rte-btn">
      {children}
    </button>
  );
}

export default function RichTextEditor({ label, value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const isUpdating = useRef(false);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !isUpdating.current) {
      const current = editorRef.current.innerHTML;
      const newVal = value || '';
      if (current !== newVal) {
        editorRef.current.innerHTML = newVal;
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isUpdating.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => { isUpdating.current = false; }, 0);
    }
  }, [onChange]);

  const exec = (cmd, arg) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg || null);
    handleInput();
  };

  const setFontSize = (e) => {
    const size = e.target.value;
    editorRef.current?.focus();
    // execCommand fontSize only accepts 1-7, so we use a workaround
    document.execCommand('fontSize', false, '7');
    const fontEls = editorRef.current?.querySelectorAll('font[size="7"]');
    fontEls?.forEach(el => {
      el.removeAttribute('size');
      el.style.fontSize = size;
    });
    handleInput();
  };

  const setFontFamily = (e) => {
    exec('fontName', e.target.value);
  };

  const setColor = (color) => {
    exec('foreColor', color);
  };

  const setHighlight = (color) => {
    exec('hiliteColor', color);
  };

  const setHeading = (e) => {
    const val = e.target.value;
    if (val === 'p') exec('formatBlock', '<p>');
    else exec('formatBlock', `<${val}>`);
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  };

  return (
    <div className="rte-wrap">
      {label && <label className="rte-label">{label}</label>}

      <div className="rte-toolbar">
        {/* Block type */}
        <select className="rte-select" onChange={setHeading} defaultValue="p">
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        {/* Font family */}
        <select className="rte-select" onChange={setFontFamily} defaultValue="Inter, sans-serif">
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Font size */}
        <select className="rte-select rte-select-sm" onChange={setFontSize} defaultValue="">
          <option value="">Size</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <span className="rte-divider" />

        <Btn cmd="bold" title="Bold"><b>B</b></Btn>
        <Btn cmd="italic" title="Italic"><i>I</i></Btn>
        <Btn cmd="underline" title="Underline"><u>U</u></Btn>
        <Btn cmd="strikeThrough" title="Strikethrough"><s>S</s></Btn>

        <span className="rte-divider" />

        <Btn cmd="justifyLeft" title="Align Left">⬅</Btn>
        <Btn cmd="justifyCenter" title="Center">↔</Btn>
        <Btn cmd="justifyRight" title="Align Right">➡</Btn>
        <Btn cmd="justifyFull" title="Justify">≡</Btn>

        <span className="rte-divider" />

        <Btn cmd="insertUnorderedList" title="Bullet List">• •</Btn>
        <Btn cmd="insertOrderedList" title="Numbered List">1.</Btn>
        <Btn cmd="indent" title="Indent">→</Btn>
        <Btn cmd="outdent" title="Outdent">←</Btn>

        <span className="rte-divider" />

        <Btn title="Link" onAction={insertLink}>🔗</Btn>
        <Btn cmd="removeFormat" title="Clear Formatting">✕ Clear</Btn>

        <span className="rte-divider" />

        {/* Text colors */}
        <span className="rte-color-label">A</span>
        {COLORS.map(c => (
          <button key={`tc-${c}`} type="button" title={`Text color: ${c}`}
            onMouseDown={e => { e.preventDefault(); setColor(c); }}
            className="rte-swatch" style={{ background: c }} />
        ))}
        {/* Custom color picker */}
        <label title="Custom text color" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
          <span className="rte-swatch" style={{ background: 'linear-gradient(135deg,#f97316,#4cc9f0,#e63946,#2d6a4f)', border: '1px solid rgba(255,255,255,0.3)' }} />
          <input type="color" style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
            onChange={e => { editorRef.current?.focus(); exec('foreColor', e.target.value); }} />
        </label>

        <span className="rte-divider" />

        {/* Highlight */}
        <span className="rte-color-label" style={{ background: '#e9c46a', color: '#000', padding: '1px 4px', borderRadius: 3 }}>H</span>
        {HIGHLIGHT_COLORS.map(c => (
          <button key={`hl-${c}`} type="button" title={`Highlight: ${c}`}
            onMouseDown={e => { e.preventDefault(); setHighlight(c); }}
            className="rte-swatch" style={{ background: c }} />
        ))}
        {/* Custom highlight picker */}
        <label title="Custom highlight color" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
          <span className="rte-swatch" style={{ background: 'linear-gradient(135deg,#ffd60a,#f97316,#4cc9f0)', border: '1px solid rgba(255,255,255,0.3)' }} />
          <input type="color" style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
            onChange={e => { editorRef.current?.focus(); exec('hiliteColor', e.target.value); }} />
        </label>
        <button type="button" title="Remove highlight"
          onMouseDown={e => { e.preventDefault(); exec('hiliteColor', 'transparent'); }}
          className="rte-swatch" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#888', fontSize: 9 }}>✕</button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="rte-editor-wrap rte-content"
        onInput={handleInput}
        data-placeholder={placeholder || 'Write something...'}
        style={{ minHeight: 140 }}
      />
    </div>
  );
}
