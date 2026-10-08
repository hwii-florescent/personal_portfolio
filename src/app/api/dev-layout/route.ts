import { writeFile, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { localEditorRequest, validLayout } from "@/data/layout";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  if (!localEditorRequest(request)) return Response.json({ error: "Saving is allowed only from this localhost site." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return new Response(null, { status: 415 });
  const text = await request.text();
  if (text.length > 16384) return new Response(null, { status: 413 });
  let layout: unknown;
  try { layout = JSON.parse(text); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!validLayout(layout)) return Response.json({ error: "Invalid layout. Positions must be within ±20; size must be 25–300%." }, { status: 400 });

  const path = join(process.cwd(), "src/data/layout.json");
  const temporary = path + "." + randomUUID() + ".tmp";
  try {
    await writeFile(temporary, JSON.stringify(layout, null, 2) + "\n", { flag: "wx" });
    await rename(temporary, path);
    revalidatePath("/");
    return Response.json({ saved: true });
  } catch (error) {
    await unlink(temporary).catch(() => {});
    console.error("Layout save failed", error);
    return Response.json({ error: "Could not write src/data/layout.json. Your changes are still in the editor; retry saving." }, { status: 500 });
  }
}
