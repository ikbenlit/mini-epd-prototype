# Swift Keyboard Shortcuts Reference

**Versie:** 1.0
**Datum:** 27-12-2024
**Status:** E5.S3 - Keyboard Shortcuts Verificatie

---

## 🎹 Global Shortcuts (altijd actief)

| Shortcut | Actie | Context | Status |
|----------|-------|---------|--------|
| **⌘K** / **Ctrl+K** | Focus command input | Overal | ✅ Werkt |
| **Escape** | Sluit actief block | Als block open is | ✅ Werkt |
| **⌘Enter** / **Ctrl+Enter** | Quick submit command | Als input focus heeft | ⏳ Toe te voegen |

---

## 📝 Command Input Shortcuts

| Shortcut | Actie | Context | Status |
|----------|-------|---------|--------|
| **Enter** | Verstuur commando | In command input | ✅ Werkt (native form) |
| **⌘Enter** / **Ctrl+Enter** | Verstuur commando | In command input | ⏳ Toe te voegen |
| **Escape** | Clear input | In command input (optioneel) | ❌ Niet geïmplementeerd |

---

## 🔍 FallbackPicker Shortcuts

| Shortcut | Actie | Context | Status |
|----------|-------|---------|--------|
| **1** | Selecteer Dagnotitie | FallbackPicker open | ✅ Werkt |
| **2** | Selecteer Zoeken | FallbackPicker open | ✅ Werkt |
| **3** | Selecteer Overdracht | FallbackPicker open | ✅ Werkt |
| **Escape** | Sluit FallbackPicker | FallbackPicker open | ✅ Werkt |

---

## 📋 Block-Specific Shortcuts

### DagnotatieBlock
| Shortcut | Actie | Context | Status |
|----------|-------|---------|--------|
| **⌘Enter** / **Ctrl+Enter** | Opslaan dagnotitie | In dagnotitie block | ⏳ Toe te voegen |
| **Escape** | Sluit block | In dagnotitie block | ✅ Werkt (global) |

### ZoekenBlock
| Shortcut | Actie | Context | Status |
|----------|-------|---------|--------|
| **Enter** | Selecteer eerste resultaat | In zoek input | ⏳ Optioneel |
| **↓ / ↑** | Navigeer door resultaten | In zoek input | ⏳ Optioneel |
| **Escape** | Sluit block | In zoeken block | ✅ Werkt (global) |

### OverdrachtBlock
| Shortcut | Actie | Context | Status |
|----------|-------|---------|--------|
| **Escape** | Sluit block | In overdracht block | ✅ Werkt (global) |

---

## 🎯 MVP Scope (E5.S3)

Voor de MVP implementeren we:

### ✅ Already Working
1. **⌘K / Ctrl+K** - Focus input
2. **Escape** - Close block
3. **Enter** - Submit form (native)
4. **1-3** - FallbackPicker quick select

### ⏳ To Add
1. **⌘Enter / Ctrl+Enter** in CommandInput - Quick submit
2. **⌘Enter / Ctrl+Enter** in DagnotatieBlock - Quick save

### ❌ Out of Scope (Future)
1. Arrow key navigation in search results
2. Escape to clear input
3. Tab for autocomplete
4. Vim-style navigation (j/k)

---

## 🧪 Test Checklist

### Global Shortcuts
- [ ] **⌘K**: Press ⌘K → Input krijgt focus
- [ ] **⌘K**: Press ⌘K from within block → Input krijgt focus
- [ ] **Escape**: Open block → Press Escape → Block sluit
- [ ] **Escape**: FallbackPicker open → Press Escape → Picker sluit

### Command Input
- [ ] **Enter**: Typ commando → Press Enter → Commando wordt verstuurd
- [ ] **Enter**: Leeg input → Press Enter → Niks gebeurt (validation)
- [ ] **⌘Enter**: Typ commando → Press ⌘Enter → Commando wordt verstuurd
- [ ] **⌘Enter**: Focus niet in input → Press ⌘Enter → Niks gebeurt

### FallbackPicker
- [ ] **1**: FallbackPicker open → Press 1 → Dagnotitie opent
- [ ] **2**: FallbackPicker open → Press 2 → Zoeken opent
- [ ] **3**: FallbackPicker open → Press 3 → Overdracht opent
- [ ] **Numbers**: In input field → Press 1-3 → Nummer wordt getypt (niet shortcut)

### DagnotatieBlock
- [ ] **⌘Enter**: Vul form in → Press ⌘Enter → Dagnotitie wordt opgeslagen
- [ ] **⌘Enter**: Form incomplete → Press ⌘Enter → Validation error
- [ ] **Escape**: DagnotatieBlock open → Press Escape → Block sluit

### Edge Cases
- [ ] Multiple shortcuts in rapid succession (⌘K → Escape → Enter)
- [ ] Shortcuts werken niet tijdens isProcessing state
- [ ] Shortcuts werken op macOS (⌘) en Windows/Linux (Ctrl)
- [ ] Shortcuts conflicteren niet met browser defaults

---

## 📝 Implementation Notes

### Cmd vs Ctrl Detection
```typescript
// Use both metaKey (Cmd on Mac) and ctrlKey (Ctrl on Windows/Linux)
if (e.metaKey || e.ctrlKey) {
  // Handle shortcut
}
```

### Preventing Default Behavior
```typescript
// Always preventDefault for custom shortcuts
if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
  e.preventDefault(); // Prevent browser's native ⌘K
  inputRef.current?.focus();
}
```

### Conditional Shortcuts
```typescript
// Only handle when not in input/textarea
if (e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement) {
  return; // Let native behavior handle it
}
```

### Accessibility
- All shortcuts should have visual hints (e.g., "⌘K" label)
- Shortcuts should work with screen readers
- Focus management must be clear (visible focus ring)

---

## 🔧 Future Enhancements

### Phase 2
- **Cmd+Shift+K** - Toggle voice input
- **Cmd+/** - Show keyboard shortcuts help
- **Cmd+P** - Quick patient search
- **Cmd+N** - New dagnotitie
- **Cmd+O** - Open overdracht

### Phase 3
- Customizable shortcuts (user preferences)
- Vim-style modal editing
- Search results navigation (arrow keys)
- Multi-block shortcuts (Cmd+1, Cmd+2, etc.)

---

## 📚 Resources

- [MDN: KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [Keyboard Event Viewer](https://keycode.info/)
- [macOS Keyboard Shortcuts Guidelines](https://developer.apple.com/design/human-interface-guidelines/keyboards)
