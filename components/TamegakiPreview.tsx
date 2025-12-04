"use client";

import React, { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Download, Share2 } from "lucide-react"; // Assuming lucide-react is installed for the icon

import { toPng } from 'html-to-image';
import { useRef } from 'react';

export function TamegakiPreview() {
  const [name, setName] = useState("");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("user-tamegaki.png");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const previewRef = useRef<HTMLDivElement>(null);

  const backgrounds = [
    { file: "user-tamegaki.png", font: "var(--font-shippori-mincho)", label: "筆文字 (明朝)" },
    { file: "image2.png", font: "var(--font-noto-sans-jp)", label: "ゴシック" },
    { file: "image3.png", font: "var(--font-yuji-syuku)", label: "筆文字 (行書)" },
    { file: "image4.png", font: "var(--font-zen-antique)", label: "アンティーク" },
  ];

  const colors = [
    { code: "#ffffff", label: "白" },
    { code: "#fcfaf2", label: "生成" },
    { code: "#fff0f5", label: "桜" },
    { code: "#f0f8ff", label: "空" },
    { code: "#f0fff0", label: "若草" },
    { code: "#fffacd", label: "檸檬" },
    { code: "#e6e6fa", label: "藤" },
    { code: "#ffdab9", label: "桃" },
    { code: "#e0ffff", label: "水" },
    { code: "#d1ffdb", label: "柳" },
    { code: "#ffe4c4", label: "杏" },
    { code: "#ffb6c1", label: "撫子" },
    { code: "#dda0dd", label: "菫" },
    { code: "#afeeee", label: "浅葱" },
    { code: "#98fb98", label: "抹茶" },
    { code: "#fafad2", label: "黄金" },
    { code: "#dcdcdc", label: "銀鼠" },
    { code: "#ffa07a", label: "珊瑚" },
    { code: "#7fffd4", label: "翡翠" },
    { code: "#87cefa", label: "露草" },
    { code: "#faebd7", label: "練色" },
  ];

  const currentFont = backgrounds.find(b => b.file === selectedImage)?.font || "var(--font-shippori-mincho)";

  const handleDownload = async () => {
    if (previewRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'tamegaki.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("name", name);
    url.searchParams.set("sender", sender);
    if (message) url.searchParams.set("message", message);
    url.searchParams.set("image", selectedImage);
    url.searchParams.set("font", currentFont);
    url.searchParams.set("color", selectedColor);

    if (navigator.share) {
      try {
        await navigator.share({
          title: '為書きジェネレーター',
          text: `${name || '候補者'}殿への為書きを作成しました。`,
          url: url.toString(),
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      await navigator.clipboard.writeText(url.toString());
      alert('URLをコピーしました！');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
      {/* Input Form */}
      <div className="w-full md:w-1/3 flex flex-col gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        {/* ... (Header and Description) ... */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-black rounded-full"></span>
            入力フォーム
          </h2>
          <p className="text-sm text-gray-500">
            必要な情報を入力してください。プレビューにリアルタイムで反映されます。
          </p>
        </div>

        <div className="space-y-6">
          {/* ... (Image Switcher, Color Switcher, Inputs) ... */}
          {/* Image Switcher - Circular Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              デザイン選択
            </label>
            <div className="flex flex-wrap gap-3">
              {backgrounds.map((bg) => (
                <button
                  key={bg.file}
                  onClick={() => setSelectedImage(bg.file)}
                  className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all transform hover:scale-105 ${selectedImage === bg.file
                    ? "border-black ring-2 ring-black ring-offset-2 scale-105"
                    : "border-gray-200 hover:border-gray-400"
                    }`}
                  title={bg.label}
                >
                  <img
                    src={`/${bg.file}`}
                    alt={bg.label}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: "center 15%" }}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {backgrounds.find(b => b.file === selectedImage)?.label}
            </p>
          </div>

          {/* Color Switcher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              背景色変更
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedColor(c.code)}
                  className={`w-8 h-8 rounded-full border transition-all transform hover:scale-110 ${selectedColor === c.code
                    ? "ring-2 ring-black ring-offset-2 scale-110 border-gray-400"
                    : "border-gray-200 hover:border-gray-400"
                    }`}
                  style={{ backgroundColor: c.code }}
                  title={c.label}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {colors.find(c => c.code === selectedColor)?.label}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              候補者名 (6文字以内推奨)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：山田太郎"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              贈呈者名
            </label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="例：鈴木花子"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              応援メッセージ
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="例：必勝！"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleShare}
            className="flex-1 bg-red-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-red-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            シェア
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            保存
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="w-full md:w-2/3 bg-gray-100 rounded-xl p-4 md:p-8 flex items-center justify-center min-h-[600px]">
        <div
          ref={previewRef}
          className="relative w-full max-w-[600px] shadow-2xl overflow-hidden"
          style={{ aspectRatio: '4/5', backgroundColor: selectedColor }}
        >
          {/* Background Image with Multiply Blend Mode */}
          <img
            src={`/${selectedImage}`}
            alt="Tamegaki Background"
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
          />

          {/* Content Overlay */}
          <div className="absolute inset-0 p-[8%] text-black font-serif" style={{ fontFamily: currentFont }}>
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Candidate Name - Right side (Absolute Position) */}
              <div
                className="absolute z-10 flex flex-row items-center" // flex-row for T-to-B in vertical-rl
                style={{
                  right: '8.33%',  // 100px / 1200px (Moved 20px right from 120px)
                  top: '10%',      // 150px / 1500px
                  height: '80%',   // Allow space for long names
                  writingMode: 'vertical-rl',
                }}
              >
                <h1 className="text-5xl md:text-[4rem] font-black tracking-widest leading-tight" style={{ fontFamily: currentFont }}>
                  {name || "候補者名"}
                </h1>
                <div className="mt-4 text-2xl md:text-3xl" style={{ fontFamily: currentFont }}>殿</div>
              </div>

              {/* Message - Middle (Absolute Position) */}
              <div
                className="absolute z-10 flex flex-col items-center"
                style={{
                  right: '73.5%',  // 882px / 1200px (Moved 30px left from 852px)
                  top: '26.6%',    // 400px / 1500px
                  height: '60%',   // Constrain height to force wrapping
                  maxHeight: '60%',
                  writingMode: 'vertical-rl',
                }}
              >
                {message && (
                  <p className="text-xl md:text-2xl font-bold whitespace-pre-wrap text-center tracking-widest break-words leading-[26px] md:leading-[31px]" style={{ fontFamily: currentFont }}>
                    {message}
                  </p>
                )}
              </div>

              {/* Sender Name - Left side (Absolute Position) */}
              <div
                className="absolute z-10 flex flex-col items-end" // flex-col for R-to-L columns
                style={{
                  right: '86%',    // 1032px / 1200px (Moved 10px left from 1022px)
                  top: '46.6%',    // 700px / 1500px
                  height: '40%',   // Allow space
                  writingMode: 'vertical-rl',
                }}
              >
                <div className="flex flex-col items-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-wider" style={{ fontFamily: currentFont }}>
                    {sender || "贈呈者名"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
