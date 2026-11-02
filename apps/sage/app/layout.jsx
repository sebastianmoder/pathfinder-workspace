import { Banner, Head } from 'nextra/components'
import { Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import Script from 'next/script'
import Footer from '../components/footer'
import 'nextra-theme-docs/style.css'
import '../styles/globals.css'
import '../styles/chat.css'

function HeaderLogo() {
  return (
    <div className="text-lg font-extrabold">
      <span style={{ color: '#004494' }}>Pathfinder SAGE</span>
    </div>
  )
}

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
  const navbar = (
    <Navbar
      logo={<HeaderLogo />}
      projectLink="https://github.com/Sebstep/pathfinder-sage"
    />
  )
  const pageMap = await getPageMap()

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/icon.ico" type="image/x-icon" />
      </Head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6DRGEDEGZ2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-6DRGEDEGZ2');`}
        </Script>
        <Script
          src="https://kit.fontawesome.com/6a5bc08ebc.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />

        <Layout
          banner={
            <Banner storageKey="pathfinder-sage-development-banner">
              {'🚧 This site is under development; its content is not final and may change at any time. 🚧'}
            </Banner>
          }
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
      </body>
    </html>
  )
}
