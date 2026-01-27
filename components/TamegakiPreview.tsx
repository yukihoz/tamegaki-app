"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Download, Share2, Facebook, Twitter, Loader2 } from "lucide-react";

import { toPng } from 'html-to-image';

type Props = {
    initialParams?: { [key: string]: string | string[] | undefined };
};

export function TamegakiPreview({ initialParams }: Props) {
    const [name, setName] = useState((initialParams?.name as string) || "");
    const [nameTitle, setNameTitle] = useState((initialParams?.nameTitle as string) || "");
    const [sender, setSender] = useState((initialParams?.sender as string) || "");
    const [senderTitle, setSenderTitle] = useState((initialParams?.senderTitle as string) || "");
    const [senderImage, setSenderImage] = useState((initialParams?.senderImage as string) || "");
    const [message, setMessage] = useState((initialParams?.message as string) || "");
    const [selectedImage, setSelectedImage] = useState((initialParams?.image as string) || "1.png");
    const [selectedColor, setSelectedColor] = useState((initialParams?.color as string) || "#ffffff");
    const [isUploading, setIsUploading] = useState(false);
    const [scale, setScale] = useState(1);

    const containerRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const prefix = '';

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                // 600px is the base width of the preview
                // We add some padding calculation if needed, but here we just take the container width.
                // If container is smaller than 600, we scale down.
                setScale(Math.min(width / 600, 1));
            }
        };

        window.addEventListener('resize', updateScale);
        updateScale(); // Initial calculation

        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const handleSenderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSenderImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const backgrounds = [
        { file: "1.png", font: "var(--font-shippori-mincho)", label: "" },
        { file: "2.png", font: "var(--font-noto-sans-jp)", label: "" },
        { file: "3.png", font: "var(--font-yuji-syuku)", label: "" },
        { file: "4.png", font: "var(--font-noto-sans-jp)", label: "" },
        { file: "5.png", font: "var(--font-noto-sans-jp)", label: "" },
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
            const dataUrl = await toPng(previewRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                width: 600,
                height: 750,
                style: {
                    transform: 'none',
                    transformOrigin: 'top left'
                }
            });
            const link = document.createElement('a');
            link.download = 'tamegaki.png';
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    const uploadImage = async (): Promise<{ imageUrl: string; ogUrl: string } | null> => {
        if (!previewRef.current) return null;
        setIsUploading(true);
        try {
            // 1. Generate Original Image (Vertical)
            // Force capture at full scale (600x750) regardless of current screen scale
            const dataUrl = await toPng(previewRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                width: 600,
                height: 750,
                style: {
                    transform: 'none',
                    transformOrigin: 'top left'
                }
            });
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // 2. Generate Padded OGP Image (Horizontal 1200x630)
            const ogCanvas = document.createElement('canvas');
            ogCanvas.width = 1200;
            ogCanvas.height = 630;
            const ctx = ogCanvas.getContext('2d');

            if (ctx) {
                // Load and draw cover background
                const coverImg = new window.Image();
                await new Promise((resolve, reject) => {
                    coverImg.onload = resolve;
                    coverImg.onerror = reject;
                    coverImg.src = '/images/base2.png';
                });
                ctx.drawImage(coverImg, 0, 0, 1200, 630);

                // Load original image to draw on canvas
                const img = new window.Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = dataUrl;
                });

                // Calculate dimensions to fit height (contain)
                // Source: 1200x1500 -> Target height 630
                // Scale factor = 630 / 1500 = 0.42
                const scale = 630 / img.height;
                const drawWidth = img.width * scale;
                const drawHeight = 630;

                // Position at right side (1200 - width - margin)
                // maintain same margin (45px) from edge
                const startX = 1200 - drawWidth - 45;

                ctx.drawImage(img, startX, 0, drawWidth, drawHeight);
            }

            const ogBlob = await new Promise<Blob | null>(resolve => ogCanvas.toBlob(resolve, 'image/png'));
            if (!ogBlob) throw new Error('Failed to create OGP image');

            // 3. Upload Original
            const uploadRes = await fetch(`/api/upload?filename=tamegaki-${Date.now()}.png`, {
                method: 'POST',
                body: blob,
            });
            if (!uploadRes.ok) throw new Error('Upload failed');
            const newBlob = await uploadRes.json();

            // 4. Upload OGP
            const ogUploadRes = await fetch(`/api/upload?filename=tamegaki-og-${Date.now()}.png`, {
                method: 'POST',
                body: ogBlob,
            });
            if (!ogUploadRes.ok) throw new Error('OGP Upload failed');
            const newOgBlob = await ogUploadRes.json();

            return { imageUrl: newBlob.url, ogUrl: newOgBlob.url };
        } catch (error) {
            console.error(error);
            alert('画像のアップロードに失敗しました。');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleTwitterShare = async () => {
        // Open window immediately to avoid popup blockers
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write('<html><body style="background:#f5f5f4; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif; color:#57534e;"><div>準備中...</div></body></html>');
        }

        const result = await uploadImage();
        if (!result) {
            newWindow?.close();
            return;
        }

        const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(result.imageUrl)}&og=${encodeURIComponent(result.ogUrl)}`;
        const text = `${name || '候補者'}殿への為書きを作成しました。 #為書きジェネレーター`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;

        if (newWindow) {
            newWindow.location.href = twitterUrl;
        } else {
            window.open(twitterUrl, '_blank');
        }
    };

    const handleFacebookShare = async () => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write('<html><body style="background:#f5f5f4; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif; color:#57534e;"><div>準備中...</div></body></html>');
        }

        const result = await uploadImage();
        if (!result) {
            newWindow?.close();
            return;
        }

        const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(result.imageUrl)}&og=${encodeURIComponent(result.ogUrl)}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

        if (newWindow) {
            newWindow.location.href = facebookUrl;
        } else {
            window.open(facebookUrl, '_blank');
        }
    };

    const handleShare = async () => {
        const result = await uploadImage();
        if (!result) return;

        const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(result.imageUrl)}&og=${encodeURIComponent(result.ogUrl)}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '為書きジェネレーター',
                    text: `${name || '候補者'}殿への為書きを作成しました。`,
                    url: shareUrl,
                });
            } catch (err) {
                console.error('Share failed', err);
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert('URLをコピーしました！');
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
            {/* Input Form */}
            <div className="w-full md:w-1/3 flex flex-col gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-black rounded-full"></span>
                        入力フォーム
                    </h2>
                    <p className="text-sm text-gray-500">
                        選挙や応援に使える「為書き」をWeb上で簡単に作成・シェアできます。
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            デザイン選択
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {backgrounds.map((bg) => (
                                <button
                                    key={bg.file}
                                    onClick={() => setSelectedImage(bg.file)}
                                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all transform hover:scale-105 ${selectedImage === bg.file
                                        ? "border-black ring-2 ring-black ring-offset-2 scale-105"
                                        : "border-gray-200 hover:border-gray-400"
                                        }`}
                                >
                                    <img
                                        src={`${prefix}/${bg.file}`}
                                        alt="background"
                                        className="w-full h-full object-cover"
                                        style={{ objectPosition: "center 15%" }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                肩書き (候補者)
                            </label>
                            <input
                                type="text"
                                value={nameTitle}
                                onChange={(e) => setNameTitle(e.target.value)}
                                placeholder="◯◯◯◯議員候補"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                候補者名
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="候補者名"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            肩書き (送り主)
                        </label>
                        <input
                            type="text"
                            value={senderTitle}
                            onChange={(e) => setSenderTitle(e.target.value)}
                            placeholder="肩書き"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            送り主名
                        </label>
                        <input
                            type="text"
                            value={sender}
                            onChange={(e) => setSender(e.target.value)}
                            placeholder="送り主名"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        送り主画像
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleSenderImageUpload}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-black hover:file:bg-gray-100 transition-all border border-gray-200 rounded-lg"
                    />
                    {senderImage && (
                        <button
                            onClick={() => setSenderImage("")}
                            className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                        >
                            画像を削除
                        </button>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        応援メッセージ
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="◯◯さん、いつも応援しています。頑張ってください！"
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50 resize-none"
                    />
                </div>
            </div>



            <div className="w-full md:w-2/3 bg-gray-100 rounded-xl p-4 md:p-8 flex flex-col items-center justify-start min-h-[600px] gap-6">

                {/* Scale Container */}
                <div
                    ref={containerRef}
                    className="w-full flex justify-center overflow-hidden"
                >
                    {/* Size Reservation Wrapper */}
                    <div
                        style={{
                            width: 600 * scale,
                            height: 750 * scale,
                            position: 'relative',
                        }}
                    >
                        {/* Actual Preview Element (Fixed 600x750) */}
                        <div
                            ref={previewRef}
                            className="absolute top-0 left-0 bg-white shadow-2xl overflow-hidden"
                            style={{
                                width: 600,
                                height: 750,
                                backgroundColor: selectedColor,
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                            }}
                        >
                            <img
                                src={`${prefix}/${selectedImage}`}
                                alt="Tamegaki Background"
                                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
                            />

                            <div className="absolute inset-0 p-[8%] text-black font-serif" style={{ fontFamily: currentFont }}>
                                <div className="relative w-full h-full flex flex-col items-center justify-center">

                                    <div
                                        className="absolute z-10 flex flex-col items-center whitespace-nowrap"
                                        style={{
                                            right: '0%',
                                            top: '11.33%',
                                            writingMode: 'vertical-rl',
                                        }}
                                    >
                                        <p
                                            className={clsx(
                                                "text-4xl font-bold tracking-widest",
                                                !nameTitle ? "text-gray-400" : "text-black"
                                            )}
                                            style={{ fontFamily: currentFont }}
                                        >
                                            {nameTitle || "◯◯◯◯議員候補"}
                                        </p>
                                    </div>

                                    <div
                                        className="absolute z-10 flex flex-row items-center"
                                        style={{
                                            right: '8.33%',
                                            top: '16.66%',
                                            height: '80%',
                                            writingMode: 'vertical-rl',
                                        }}
                                    >
                                        <h1
                                            className={clsx(
                                                "text-[3.2rem] font-black tracking-widest leading-tight",
                                                !name ? "text-gray-400" : "text-black"
                                            )}
                                            style={{ fontFamily: currentFont }}
                                        >
                                            {name || "候補者名"}
                                        </h1>
                                        <div className="mt-4 text-3xl" style={{ fontFamily: currentFont }}>殿</div>
                                    </div>

                                    <div
                                        className="absolute z-10 flex flex-col items-start justify-start"
                                        style={{
                                            right: '0%',
                                            top: '94%',
                                            width: '100%',
                                            writingMode: 'horizontal-tb',
                                        }}
                                    >
                                        <p
                                            className={clsx(
                                                "text-[18px] font-bold whitespace-pre-wrap text-left tracking-widest break-words leading-[24px]",
                                                !message ? "text-gray-400" : "text-black"
                                            )}
                                            style={{ fontFamily: currentFont }}
                                        >
                                            {message || "◯◯さん、いつも応援しています。頑張ってください！"}
                                        </p>
                                    </div>

                                    <div
                                        className="absolute z-10 flex flex-col items-start whitespace-nowrap"
                                        style={{
                                            right: '80%',
                                            top: '36%',
                                            height: '40%',
                                            writingMode: 'vertical-rl',
                                        }}
                                    >
                                        <p
                                            className={clsx(
                                                "text-[1.9rem] font-bold tracking-widest",
                                                !senderTitle ? "text-gray-400" : "text-black"
                                            )}
                                            style={{ fontFamily: currentFont }}
                                        >
                                            {senderTitle || "肩書き"}
                                        </p>
                                    </div>

                                    {senderImage && (
                                        <div
                                            className="absolute z-10 flex items-center justify-center"
                                            style={{
                                                right: '79.33%',
                                                top: '15.33%',
                                                width: '16.6%',
                                                height: '13.3%',
                                            }}
                                        >
                                            <img
                                                src={senderImage}
                                                alt="Sender"
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                    )}

                                    <div
                                        className="absolute z-10 flex flex-col items-start"
                                        style={{
                                            right: '87.66%',
                                            top: '42%',
                                            height: '70%',
                                            writingMode: 'vertical-rl',
                                        }}
                                    >
                                        <div className="flex flex-col items-center">
                                            <p
                                                className={clsx(
                                                    "text-[2.5rem] font-bold tracking-wider",
                                                    !sender ? "text-gray-400" : "text-black"
                                                )}
                                                style={{ fontFamily: currentFont }}
                                            >
                                                {sender || "送り主名"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[600px] flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            onClick={handleTwitterShare}
                            disabled={isUploading}
                            className="flex-1 bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Twitter className="w-5 h-5" />}
                            {isUploading ? '作成中...' : 'Xで投稿'}
                        </button>
                        <button
                            onClick={handleFacebookShare}
                            disabled={isUploading}
                            className="flex-1 bg-[#1877F2] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#166fe5] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Facebook className="w-5 h-5" />}
                            {isUploading ? '作成中...' : 'シェア'}
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleShare}
                            disabled={isUploading}
                            className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                            {isUploading ? '作成中...' : 'リンク'}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
