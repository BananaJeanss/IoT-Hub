"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import Image from "next/image";

export default function EditProfileModal({
  user,
  onClose,
}: {
  user: User & { tags?: string[] };
  onClose: () => void;
}) {
  const [bio, setBio] = useState(user.bio ?? "");
  const [tags, setTags] = useState<string[]>(user.tags ?? []);
  const [backgroundType, setBackgroundType] = useState(
    user.backgroundType ?? "gradient"
  );
  const [gradientStart, setGradientStart] = useState(
    user.gradientStartRgb ?? "#00b7ff"
  );
  const [gradientEnd, setGradientEnd] = useState(
    user.gradientEndRgb ?? "#b3ffec"
  );
  const [banner, setBanner] = useState<string | null>(
    user.backgroundImage ?? null
  );

  const [pfp, setPfp] = useState<string | null>(user.image ?? null);

  const router = useRouter();

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleRemoveBanner = () => {
    setBanner(null);
    setBackgroundType("gradient");
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 5
        ? [...prev, tag]
        : prev
    );
  };

  const allTags = [
    "IoT",
    "SmartHome",
    "Automation",
    "ESP32",
    "Linux",
    "3D Printing",
    "Open Source",
  ];

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok && data.url) {
      setBanner(data.url);
      setBackgroundType("image");
    } else {
      alert(data.error || "Upload failed");
    }
  };

  const handlePfpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok && data.url) {
      setPfp(data.url);
    } else {
      alert(data.error || "Upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio,
        tags,
        image: pfp,
        backgroundImage: backgroundType === "image" ? banner : null,
        backgroundType,
        gradientStartRgb: backgroundType === "gradient" ? gradientStart : null,
        gradientEndRgb: backgroundType === "gradient" ? gradientEnd : null,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      alert(result.error || "Something went wrong");
    }
  };

  return (
    <div className="overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Edit Profile</h2>

        <div className="banner‐pfp‐wrapper">
          <div className="banner-preview">
            {backgroundType === "image" && banner ? (
              <Image
                src={banner}
                alt="banner preview"
                width={600}
                height={200}
                className="banner-img"
                unoptimized
                onError={() => {
                  setBanner(null);
                  setBackgroundType("gradient");
                }}
              />
            ) : (
              <div
                className="banner-gradient"
                style={{
                  background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                }}
              />
            )}
            <div className="banner-buttons">
              {banner ? (
                <button type="button" onClick={handleRemoveBanner}>
                  Remove Banner
                </button>
              ) : (
                <label>
                  Upload Banner
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    hidden
                  />
                </label>
              )}
              <button
                type="button"
                onClick={() => setBackgroundType("gradient")}
              >
                Change Gradient
              </button>
              {backgroundType === "gradient" && (
                <div className="gradient-picker">
                  <input
                    type="color"
                    value={gradientStart}
                    onChange={(e) => setGradientStart(e.target.value)}
                  />
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={(e) => setGradientEnd(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pfp-upload-container">
            <label className="pfp-preview" style={{ cursor: "pointer" }}>
              <Image
                src={pfp || "/assets/user.png"}
                alt="Profile picture"
                width={96}
                height={96}
                className="pfp-preview"
                unoptimized
              />
              <input
                type="file"
                accept="image/*"
                onChange={handlePfpUpload}
                hidden
              />
              {!pfp && <span>+</span>}
            </label>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input type="text" value={`@${user.username}`} disabled style={{ marginTop: '25px' }} />

          <textarea
            maxLength={160}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us something cool…"
            rows={3}
          />
          <small>{bio.length}/160</small>

          <h3 style={{ marginBottom: "0px" }}>Tags:</h3>
          <div className="tag-selector">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tag-btn ${tags.includes(tag) ? "selected" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleTag(tag);
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <button type="submit" className="save-btn">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
