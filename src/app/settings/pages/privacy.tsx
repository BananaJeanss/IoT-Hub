interface PrivacyPageProps {
  user: {
    username: string;
    email: string;
    image?: string;
    bio?: string;
    tags?: string[];
  };
  form: {
    username: string;
    email: string;
    bio: string;
    image: string;
    wallCommentsPrivacy: string;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handlePasswordSubmit: (e: React.FormEvent) => void;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  password2: string;
  setPassword2: React.Dispatch<React.SetStateAction<string>>;
  passwordStrength: { score: number; label: string; color: string };
  loading: boolean;
}

export default function PrivacyPage({
  user,
  form,
  handleChange,
  handlePasswordSubmit,
  password,
  setPassword,
  password2,
  setPassword2,
  passwordStrength,
  loading,
}: PrivacyPageProps) {
  return (
    <div className="settings-page">
      <h1>Settings</h1>
    </div>
  );
}
