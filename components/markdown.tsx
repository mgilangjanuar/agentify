'use client'

import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'

export default function Markdown({ content }: { content: string }) {
  return <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        return !inline ? (
          <SyntaxHighlighter
            style={dracula as any}
            language={match?.[1]}
            PreTag="div"
            {...props}
          >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        )
      },
      h1({ children }) {
        return <h1 className="mt-6 scroll-m-20 text-4xl pb-4 font-extrabold tracking-tight">
          {children}
        </h1>
      },
      h2({ children }) {
        return <h2 className="mt-6 scroll-m-20 border-b- pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          {children}
        </h2>
      },
      h3({ children }) {
        return <h3 className="mt-6 scroll-m-20 text-2xl font-semibold tracking-tight">
          {children}
        </h3>
      },
      h4({ children }) {
        return <h4 className="mt-6 scroll-m-20 text-xl font-semibold tracking-tight">
          {children}
        </h4>
      },
      p({ children }) {
        return <p className="break-anywhere leading-7 [&:not(:first-child)]:mt-6">
          {children}
        </p>
      },
      a({ children, href }) {
        return <a href={href} className="underline underline-offset-4">
          {children}
        </a>
      },
      blockquote({ children }) {
        return <blockquote className="mt-6 border-l-2 pl-6 italic">
          {children}
        </blockquote>
      },
      ul({ children }) {
        return <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          {children}
        </ul>
      },
      ol({ children }) {
        return <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
          {children}
        </ol>
      },
      table({ children }) {
        return <div className="my-6 w-full overflow-y-auto">
          <table className="w-full">
            {children}
          </table>
        </div>
      },
      tr({ children }) {
        return <tr className="m-0 border-t p-0 even:bg-muted">
          {children}
        </tr>
      },
      th({ children }) {
        return <th className="whitespace-nowrap border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
          {children}
        </th>
      },
      td({ children }) {
        return <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
          {children}
        </td>
      },
      hr() {
        return <hr className="mb-6" />
      }
    }}>{content}</ReactMarkdown>
}
