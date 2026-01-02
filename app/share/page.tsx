import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { searchParams }: Props
): Promise<Metadata> {
    const params = await searchParams;
    const imgUrl = (params.img as string) || "";
    // Prefer padded OGP image if available, otherwise fallback to main image
    const ogUrl = (params.og as string) || imgUrl;

    if (!imgUrl) {
        return {
            title: "為書きジェネレーター",
            description: "選挙や応援に使える「為書き」をWeb上で簡単に作成・シェアできます。",
        };
    }

    return {
        title: "為書きを作成しました | 為書きジェネレーター",
        description: "選挙や応援に使える「為書き」をWeb上で簡単に作成・シェアできます。",
        openGraph: {
            images: [ogUrl],
        },
        twitter: {
            card: 'summary_large_image',
            images: [ogUrl],
        }
    };
}

export default async function SharePage({ searchParams }: Props) {
    const params = await searchParams;
    const imgUrl = (params.img as string) || "";

    if (!imgUrl) {
        return (
            <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 font-sans">
                <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
                    <h1 className="text-xl font-bold mb-4">画像が見つかりません</h1>
                    <p className="text-gray-600 mb-6">URLが間違っているか、画像の有効期限が切れている可能性があります。</p>
                    <Link
                        href="/"
                        className="inline-block bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        新しく作る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 lg:px-8 font-sans text-stone-900 flex flex-col items-center justify-center">
            <div className="max-w-4xl mx-auto space-y-6 flex flex-col items-center w-full">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-stone-900 font-serif">
                        為書きが届きました
                    </h1>
                    <p className="text-sm text-stone-600">
                        この画像を保存して、SNSでシェアしましょう。
                    </p>
                </div>

                <div className="w-full max-w-[600px] shadow-2xl rounded-sm overflow-hidden bg-white max-h-[75vh] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imgUrl}
                        alt="為書き"
                        className="w-full h-full object-contain max-h-[75vh]"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[600px]">
                    <a
                        href={imgUrl}
                        download="tamegaki.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        画像を保存する
                    </a>

                    <Link
                        href="/"
                        className="flex-1 bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                        自分も作成する
                    </Link>
                </div>

                <footer className="text-center text-stone-500 text-sm py-4 mt-8">
                    このサイトは、<a href="https://x.com/ninofku" target="_blank" rel="noreferrer" className="underline hover:text-stone-800 transition-colors">ほづみゆうき</a>が作成したものです。
                </footer>
            </div>
        </main>
    );
}
