'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough, Paperclip, Underline } from 'lucide-react'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import UnderlineExtension from '@tiptap/extension-underline'
import { Extension } from '@tiptap/core'

const FontSizeExtension = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: `${fontSize}px` })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .run()
      },
    }
  },
})

const Tiptap = ({ content, onChange }: { content: string, onChange: (html: string, json: object) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      TextStyle.configure(),
      Color.configure(),
      UnderlineExtension,
      FontSizeExtension,
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML(), editor.getJSON())
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    if (size) {
      // @ts-ignore
      editor.chain().focus().setFontSize(size).run();
    } else {
      // @ts-ignore
      editor.chain().focus().unsetFontSize().run();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editor.chain().focus().setColor(e.target.value).run()
  };

  return (
    <div>
      <div className="flex items-center gap-2 p-2 border-b">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <Bold className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <Italic className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <Strikethrough className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
        >
          <Underline className="w-5 h-5" />
        </button>
        <select onChange={handleFontSizeChange}>
          <option value="">Font size</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
          <option value="28">28</option>
          <option value="32">32</option>
          <option value="36">36</option>
          <option value="48">48</option>
          <option value="60">60</option>
          <option value="72">72</option>
        </select>
        <input
            type="color"
            onInput={handleColorChange}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="color-picker"
          />
        <button
          onClick={() => alert('API de anexo de arquivos a ser implementada')}
        >
          <Paperclip className="w-5 h-5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default Tiptap