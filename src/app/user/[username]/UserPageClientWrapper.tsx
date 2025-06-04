'use client';

import { useState } from 'react';
import EditProfileModal from './EditProfileModal';
import Image from 'next/image';
import { User } from "@prisma/client";

export default function UserPageClientWrapper({
  user,
  isOwner,
  bgStyle,
}: {
  user: User & { tags?: string[] };
  isOwner: boolean;
  bgStyle: React.CSSProperties;
}) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div id="pfp-info-container" style={bgStyle}>
        <div className="profile-bg-overlay"></div>
        <div id="public-info-cont">
          <div id="pfp">
            <Image
              src={user.image || '/assets/user.png'}
              alt="Profile Picture"
              width={512}
              height={512}
              className="profile-img"
            />
          </div>
          <div id="info">
            <h2>{`@${user.username ?? "unknown"}`}</h2>
            <p>{user.bio}</p>
            <div id="interest-tags">
              {(user.tags ?? []).map((tag: string) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        {isOwner && (
          <div id="profile-buttons">
            <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {showEditModal && (
        <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}
