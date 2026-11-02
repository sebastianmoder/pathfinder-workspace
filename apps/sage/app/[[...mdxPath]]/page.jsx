import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { notFound } from 'next/navigation'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

function isReservedPath(mdxPath = []) {
  return mdxPath[0] === '_pagefind'
}

export async function generateMetadata(props) {
  const params = await props.params
  if (isReservedPath(params.mdxPath)) notFound()
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props) {
  const params = await props.params
  if (isReservedPath(params.mdxPath)) notFound()
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode
  } = await importPage(params.mdxPath)

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
