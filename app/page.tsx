"use client";

import React, { useState, useEffect } from "react";
import { TamegakiPreview } from "@/components/TamegakiPreview";
import { Share2, Download, RefreshCw } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl font-serif">
            為書きジェネレーター
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            選挙や応援に使える「為書き（必勝ビラ）」をWeb上で簡単に作成・シェアできます。
          </p>
        </div>

        <TamegakiPreview />
      </div>
    </main>
  );
}
