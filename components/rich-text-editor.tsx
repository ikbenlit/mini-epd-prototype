'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({ placeholder: placeholder || 'Schrijf iets...', includeChildren: true }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[160px] px-3 py-2 text-slate-800 bg-white',
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const html = value || '';
    if (html !== editor.getHTML()) {
      editor.commands.setContent(html);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="rounded-lg border border-slate-200 h-32 animate-pulse bg-slate-50" />;
  }

  const toggle = (command: () => void) => {
    editor.chain().focus();
    command();
  };

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <button
          type="button"
          onClick={() => toggle(() => editor.chain().focus().toggleBold().run())}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md text-xs text-slate-600 hover:bg-white',
            editor.isActive('bold') && 'bg-white text-slate-900'
          )}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => toggle(() => editor.chain().focus().toggleItalic().run())}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md text-xs text-slate-600 hover:bg-white',
            editor.isActive('italic') && 'bg-white text-slate-900'
          )}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => toggle(() => editor.chain().focus().toggleBulletList().run())}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md text-xs text-slate-600 hover:bg-white',
            editor.isActive('bulletList') && 'bg-white text-slate-900'
          )}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => toggle(() => editor.chain().focus().toggleOrderedList().run())}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md text-xs text-slate-600 hover:bg-white',
            editor.isActive('orderedList') && 'bg-white text-slate-900'
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => toggle(() => editor.chain().focus().toggleBlockquote().run())}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md text-xs text-slate-600 hover:bg-white',
            editor.isActive('blockquote') && 'bg-white text-slate-900'
          )}
        >
          <Quote className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
