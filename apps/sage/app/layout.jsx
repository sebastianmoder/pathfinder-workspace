import { ProjectHeader } from '@pathfinder/brand'
import { Analytics } from '@pathfinder/analytics';
import { Head } from 'nextra/components'
import { Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import Script from 'next/script'
import Footer from '../components/footer'
import 'nextra-theme-docs/style.css'
import '../styles/globals.css'
import '../styles/chat.css'
import '@pathfinder/brand/styles.css';


export const metadata = {
  title: {
    default: 'Pathfinder SAGE',
    template: '%s | Pathfinder SAGE'
  },
  description:
    'Pioneering AI Technology in Higher Education to Facilitate Innovation and Nurture the Development of Entrepreneurial Resources',
  applicationName: 'Pathfinder SAGE',
  generator: 'Next.js'
}


export default async function RootLayout({ children }) {
  const navbar = <><ProjectHeader product="sage" /><Navbar logo={<span>SAGE · Teaching with AI</span>} /></>
  const pageMap = await getPageMap()

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head color={{ hue: 188, saturation: 64, lightness: { light: 26, dark: 70 } }} backgroundColor={{ light: "#faf7ef", dark: "#0f1d1e" }} />
      <body >
        <Script
          src="https://kit.fontawesome.com/6a5bc08ebc.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />

        <Layout
          navbar={navbar}
          footer={<Footer />}
          docsRepositoryBase="https://github.com/Sebstep/pathfinder-sage/tree/main"
          editLink={null}
          feedback={{ content: null }}
          sidebar={{
            autoCollapse: false,
            defaultMenuCollapseLevel: 1,
            toggleButton: false
          }}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      <Analytics product="sage" measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} production={process.env.CONTEXT === "production"} />
      </body>
    </html>
  )
}
