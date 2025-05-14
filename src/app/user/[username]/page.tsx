import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Image from "next/image";
import "./user.css";

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

  const isOwner = session?.user?.email === user.email;

  const bgStyle =
    user.backgroundType === "image"
      ? {
          backgroundImage: `url(${user.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backdropFilter: "blur(8px)",
        }
      : {
          background: `linear-gradient(135deg, ${user.gradientStartRgb}, ${user.gradientEndRgb})`,
        };

  return (
    <div id="main">
      <div id="profile">
        <div id="profile-container">
          <div id="left-half">
            <div id="pfp-info-container" style={bgStyle}>
              <div className="profile-bg-overlay"></div>
              <div id="public-info-cont">
                <div id="pfp">
                  <Image
                  src={user.image || "/assets/user.png"}
                  alt="Profile Picture"
                  width={96}
                  height={96}
                  className="profile-img"
                  />
                </div>
                <div id="info">
                  <h2>{user.username}</h2>
                  <p>{user.bio}</p>
                  <div id="interest-tags">
                    <span className="tag">🤖 IoT</span>
                    <span className="tag">🤖 SmartHome</span>
                    <span className="tag">🤖 Automation</span>
                  </div>
                </div>
              </div>
              {isOwner && (
                <div id="profile-buttons">
                  <button className="edit-profile-btn">Edit Profile</button>
                </div>
              )}
            </div>

            <div id="profile-projects-container">
              <h2>Projects & Guides</h2>
              <div id="profile-projects">
                <div className="profile-projects-list">
                  <h3>📌 Pinned</h3>
                  <div id="cards-list">
                    {[
                      {
                        title: "Smart Home Automation",
                        img: "../assets/logow.png",
                        desc: "Lorem ipsum dolor sit amet…",
                      },
                      {
                        title: "Weather Station",
                        img: "../assets/logow.png",
                        desc: "Lorem ipsum dolor sit amet…",
                      },
                      {
                        title: "Smart Garden",
                        img: "../assets/logow.png",
                        desc: "Lorem ipsum dolor sit amet…",
                      },
                    ].map((project, idx) => (
                        <div className="profile-project-card" key={idx}>
                        <Image
                          src={user.image ? user.image.startsWith("/") ? user.image : `/${user.image}` : "/assets/logow.png"}
                          alt="Profile Picture"
                          width={500}
                          height={500}
                          className="profile-img"
                        />
                        <a href="">
                          <h3>{project.title}</h3>
                        </a>
                        <p>{project.desc}</p>
                        <div className="stats">
                          <p>⭐ 4.8</p>
                          <p>👁️ 120</p>
                        </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="right-half">
            <div id="activity-container">
              <h2>User Wall</h2>
              <div id="activity">
                <div className="activity-card">
                  <textarea
                    className="comment-input"
                    rows={1}
                    placeholder="Leave a comment"
                  ></textarea>
                  <button className="comment-button">Post</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
