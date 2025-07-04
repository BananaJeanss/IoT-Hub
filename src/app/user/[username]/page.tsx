import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Image from 'next/image';
import './user.css';

import UserPageClientWrapper from './UserPageClientWrapper';
import WallComponent from './WallComponent';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserPage({ params }: Props) {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) return notFound();

  const pins = await prisma.pin.findMany({
    where: { userId: user.id },
    orderBy: { order: 'asc' },
    include: { project: true },
  });

  const isOwner = session?.user?.email === user.email;

  const userProjects = await prisma.project.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const userGuides = await prisma.guide.findMany({
    where: { userId: user.id },
    select: { id: true },
  });

  const hasUploads = userProjects.length > 0 || userGuides.length > 0;

  const bgStyle =
    user.backgroundType === 'image'
      ? {
          backgroundImage: `url(${user.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: 'blur(8px)',
        }
      : {
          background: `linear-gradient(135deg, ${user.gradientStartRgb}, ${user.gradientEndRgb})`,
        };

  return (
    <div id="main">
      <div id="profile">
        <div id="profile-container">
          <div id="left-half">
            <UserPageClientWrapper user={user} isOwner={isOwner} bgStyle={bgStyle} />

            <div id="profile-projects-container">
              <h2>Projects & Guides</h2>
              <div id="profile-projects">
                <hr style={{ minHeight: '2px', marginBottom: '20px' }} />
                {hasUploads && (
                  <div className="profile-projects-list">
                    {(pins.length > 0 || isOwner) && ( // pins
                      <div>
                        <div className="pinned-text-row">
                          <h3>📌 Pinned</h3>
                          {isOwner && (
                            <div id="profile-buttons">
                              <button
                                className="edit-profile-btn"
                                style={{ backgroundColor: 'var(--tertiary-color)' }}
                              >
                                Edit Pins
                              </button>
                            </div>
                          )}
                        </div>

                        <div id="cards-list">
                          {pins.length > 0
                            ? pins.map((pin) => (
                                <div className="card" key={pin.id}>
                                  <Image
                                    src={pin.project.image || '/assets/project.png'}
                                    alt={pin.project.title}
                                    width={150}
                                    height={100}
                                    className="project-image"
                                  />
                                  <h3>{pin.project.title}</h3>
                                  <p>{pin.project.description}</p>
                                </div>
                              ))
                            : isOwner && (
                                <p style={{ textAlign: 'center', color: '#888' }}>
                                  You have no pinned projects yet, why not pin some?
                                </p>
                              )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!hasUploads && (
                  <p style={{ textAlign: 'center', color: '#888', paddingTop: '25px' }}>
                    {isOwner
                      ? 'You have no projects or guides yet, why not create some?'
                      : `${user.username} has no projects or guides yet.`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div id="right-half">
            <WallComponent wallOwnerId={user.id} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </div>
  );
}
