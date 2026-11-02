import Link from 'next/link';
import { ProjectHeader } from '@pathfinder/brand';
export default function Navigation() { return <ProjectHeader product="pathfinder"><nav aria-label="Project"><Link href="/about">About the consortium</Link></nav></ProjectHeader>; }
