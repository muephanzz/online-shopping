import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  const { name, email, password } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({ data: { name, email, password: hashedPassword } });
    return Response.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    return Response.json({ message: "User already exists" }, { status: 400 });
  }
}
