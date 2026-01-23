import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // 注意：用 service key
    );

    // 最轻量的查询，不写数据
    const { error } = await supabase
      .from("predictions")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase keep-alive error:", error.message);
      return NextResponse.json({ ok: false });
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase keep-alive success",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false });
  }
}