import Image from 'next/image';
import Link from 'next/link';

export interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  slug: string;
  type: 'project' | 'guide';
  views?: number;
  stars?: number;
}

export default function ContentCard({
  title,
  description,
  image,
  slug,
  type,
  views = 0,
  stars,
}: ContentCardProps) {
  const href = `/${type === 'project' ? 'projects' : 'guides'}/${slug}`;
  return (
    <div className="content-card">
      <Image
        src={image || '/assets/logow.png'}
        alt={title}
        width={1024}
        height={1024}
        style={{ width: '100%', height: 160, objectFit: 'cover' }}
      />
      <Link href={href}>
        <h3>
          {title} {type === 'project' ? '🔧' : '📚'}
        </h3>
      </Link>
      <p>{description}</p>
      <div id="stats">
        {stars != null && <p>⭐ {stars}</p>}
        <p>👁️ {views}</p>
      </div>
    </div>
  );
}
