import Image from 'next/image';
import Link from 'next/link';

import './ContentCard.css';

export interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  slug: string;
  type: 'project' | 'guide';
  views?: number;
  stars?: number;
  gradientStart?: string | null;
  gradientEnd?: string | null;
  backgroundType?: 'image' | 'gradient';
}

export default function ContentCard({
  title,
  description,
  image,
  slug,
  type,
  views = 0,
  stars,
  gradientStart,
  gradientEnd,
  backgroundType = 'gradient',
}: ContentCardProps) {
  const href = `/${type === 'project' ? 'projects' : 'guides'}/${slug}`;

  return (
    <div className="content-card">
      <div style={{ width: '100%', height: 160, minHeight: 160 }}>
        {backgroundType === 'gradient' ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${gradientStart || '#3498db'}, ${gradientEnd || '#72b4e0'})`,
              objectFit: 'cover',
            }}
          />
        ) : (
          <Image
            src={image || '/assets/logow.png'}
            alt={title}
            width={1024}
            height={1024}
            style={{ width: '100%', height: 160, objectFit: 'cover' }}
          />
        )}
      </div>
      <Link href={href}>
        <h3>
          {title} {type === 'project' ? '🔧' : '📚'}
        </h3>
      </Link>
      <p className="truncate-2-lines" style={{ height: 36, maxHeight: 36 }}>
        {description}
      </p>
      <div id="stats">
        {stars != null && <p>⭐ {stars}</p>}
        <p>👁️ {views}</p>
      </div>
    </div>
  );
}
