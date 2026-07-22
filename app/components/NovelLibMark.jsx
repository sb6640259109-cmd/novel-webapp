import Image from 'next/image';
import Link from 'next/link';

export default function NovelLibMark({ className = 'h-9 w-9', inverted = false }) {
  return (
    <Link href="/" aria-label="กลับหน้าหลัก" className="inline-grid shrink-0 rounded-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/40">
      <span className={`${className} relative grid shrink-0 place-items-center overflow-hidden ${inverted ? '' : 'drop-shadow-[0_5px_8px_rgba(39,76,130,.22)]'}`} aria-hidden="true">
        <Image src="/branding/novellib-logo-transparent.png" alt="" fill priority unoptimized sizes="48px" className="object-contain scale-[1.08]" />
      </span>
    </Link>
  );
}
