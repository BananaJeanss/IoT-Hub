import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2"


// random gradient generation
function randomPastelRgb(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.random() * 20; // 70-90%
  const lightness = 70 + Math.random() * 10;  // 70-80%
  return `rgb(${hslToRgb(hue, saturation, lightness)})`;
}
// Convert HSL to RGB string
function hslToRgb(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ].join(", ");
}
// Usage in user creation
const gradientStartRgb = randomPastelRgb();
const gradientEndRgb = randomPastelRgb();

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken." },
        { status: 400 }
      );
    }
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 400 }
      );
    }

    // password validation/strength check
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter." },
        { status: 400 }
      );
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter." },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number." },
        { status: 400 }
      );
    }
    

    // Hash password
    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

    // Create user
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        gradientStartRgb,
        gradientEndRgb,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed." }, { status: 500 });
  }
}
