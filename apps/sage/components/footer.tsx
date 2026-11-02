import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

function FooterLogo() {
    return (
        <div className="text-lg font-extrabold">
            <span style={{ color: '#004494' }}>Erasmus+ Pathfinder</span>
        </div>
    )
}

export default function MultiColumns() {
    return (
        <footer className="container mx-auto px-8 space-y-12 md:flex md:space-y-0 md:justify-between">
            {/* left Column */}
            <div className="flex flex-col space-y-4 md:w-5/12">
                <FooterLogo />
                <p className="text-sm text-slate-600">
                    Pioneering AI Technology in Higher Education to Facilitate
                    Innovation and Nurture the Development of Entrepreneurial
                    Resources
                </p>
                <p className="text-sm text-slate-600">
                    Project:{' '}
                    <Link
                        href="https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579"
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Erasmus+ Pathfinder Project link"
                    >
                        2023-2-LI01-KA220-HED-000178579
                    </Link>
                </p>
                <p className="text-sm text-slate-600">
                    &copy; {new Date().getFullYear()} Pathfinder Project. All
                    rights reserved.
                </p>
            </div>
            {/* Right Column */}
            <div className="flex flex-col space-y-4 md:w-5/12">
                <div className="text-sm font-semibold">Declarations</div>
                <p className="text-sm text-slate-600">
                    Funded by the European Union. Views and opinions expressed
                    are however those of the author(s) only and do not
                    necessarily reflect those of the European Union or the
                    European Education and Culture Executive Agency (EACEA).
                    Neither the European Union nor EACEA can be held responsible
                    for them.
                </p>
                <div className="mt-4">
                    <Image
                        src="/funded-by-eu-wide.png"
                        alt=""
                        width={200}
                        height={50}
                        className="mx-auto md:mx-0"
                    />
                </div>
            </div>
        </footer>
    )
}
