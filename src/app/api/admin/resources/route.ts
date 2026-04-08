import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Category, ResourceItem } from "../../resources/route";

export const dynamic = "force-dynamic";

const RESOURCES_FILE = path.join(process.cwd(), "data", "resources.json");

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

function read(): { categories: Category[] } {
  try {
    const raw = fs.readFileSync(RESOURCES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { categories: [] };
  }
}

function write(data: { categories: Category[] }) {
  fs.writeFileSync(RESOURCES_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  return NextResponse.json(read());
}

// ─── POST: add category or add item ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const data = read();

  // Add category
  if (body.action === "addCategory") {
    const newCat: Category = {
      id: crypto.randomUUID(),
      title: body.title?.trim() || "新分类",
      icon: body.icon || "📁",
      color: body.color || "#6366f1",
      items: [],
    };
    data.categories.push(newCat);
    write(data);
    return NextResponse.json({ ok: true, category: newCat });
  }

  // Add item to category
  if (body.action === "addItem") {
    const catIdx = data.categories.findIndex((c) => c.id === body.categoryId);
    if (catIdx === -1) return NextResponse.json({ error: "分类不存在" }, { status: 404 });

    const newItem: ResourceItem = {
      id: crypto.randomUUID(),
      name: body.name?.trim() || "",
      desc: body.desc?.trim() || "",
      type: body.type || "视频",
      url: body.url?.trim() || "#",
    };
    data.categories[catIdx].items.push(newItem);
    write(data);
    return NextResponse.json({ ok: true, item: newItem });
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}

// ─── PUT: update category or update item ────────────────────────────────────
export async function PUT(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const data = read();

  // Update category
  if (body.action === "updateCategory") {
    const catIdx = data.categories.findIndex((c) => c.id === body.id);
    if (catIdx === -1) return NextResponse.json({ error: "分类不存在" }, { status: 404 });

    data.categories[catIdx] = {
      ...data.categories[catIdx],
      title: body.title ?? data.categories[catIdx].title,
      icon: body.icon ?? data.categories[catIdx].icon,
      color: body.color ?? data.categories[catIdx].color,
    };
    write(data);
    return NextResponse.json({ ok: true });
  }

  // Update item
  if (body.action === "updateItem") {
    const catIdx = data.categories.findIndex((c) => c.id === body.categoryId);
    if (catIdx === -1) return NextResponse.json({ error: "分类不存在" }, { status: 404 });

    const itemIdx = data.categories[catIdx].items.findIndex((i) => i.id === body.itemId);
    if (itemIdx === -1) return NextResponse.json({ error: "资源不存在" }, { status: 404 });

    data.categories[catIdx].items[itemIdx] = {
      ...data.categories[catIdx].items[itemIdx],
      name: body.name ?? data.categories[catIdx].items[itemIdx].name,
      desc: body.desc ?? data.categories[catIdx].items[itemIdx].desc,
      type: body.type ?? data.categories[catIdx].items[itemIdx].type,
      url: body.url ?? data.categories[catIdx].items[itemIdx].url,
    };
    write(data);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}

// ─── DELETE: delete category or delete item ─────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const data = read();

  // Delete category
  if (body.action === "deleteCategory") {
    const before = data.categories.length;
    data.categories = data.categories.filter((c) => c.id !== body.id);
    if (data.categories.length === before) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }
    write(data);
    return NextResponse.json({ ok: true });
  }

  // Delete item
  if (body.action === "deleteItem") {
    const catIdx = data.categories.findIndex((c) => c.id === body.categoryId);
    if (catIdx === -1) return NextResponse.json({ error: "分类不存在" }, { status: 404 });

    const before = data.categories[catIdx].items.length;
    data.categories[catIdx].items = data.categories[catIdx].items.filter((i) => i.id !== body.itemId);
    if (data.categories[catIdx].items.length === before) {
      return NextResponse.json({ error: "资源不存在" }, { status: 404 });
    }
    write(data);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}
