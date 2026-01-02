import React from "react";
import { TamegakiPreview } from "@/components/TamegakiPreview";
import { Metadata } from "next";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const params = await searchParams;
  const name = params.name ?? '';
  const nameTitle = params.nameTitle ?? '';
  const sender = params.sender ?? '';
  const senderTitle = params.senderTitle ?? '';
  const senderImage = params.senderImage ?? '';
  const message = params.message ?? '';
  const image = params.image ?? '';
  const font = params.font ?? '';
  const color = params.color ?? '';

  const ogUrl = new URL(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/og`);
  if (name) ogUrl.searchParams.set('name', name as string);
  if (nameTitle) ogUrl.searchParams.set('nameTitle', nameTitle as string);
  if (sender) ogUrl.searchParams.set('sender', sender as string);
  if (senderTitle) ogUrl.searchParams.set('senderTitle', senderTitle as string);
  if (senderImage) ogUrl.searchParams.set('senderImage', senderImage as string);
  if (message) ogUrl.searchParams.set('message', message as string);
  if (image) ogUrl.searchParams.set('image', image as string);
  if (font) ogUrl.searchParams.set('font', font as string);
  if (color) ogUrl.searchParams.set('color', color as string);

  return {
    openGraph: {
      images: [ogUrl.toString()],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogUrl.toString()],
    }
  };
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-stone-100 py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl font-serif">
            為書きジェネレーター
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            選挙や応援に使える「為書き」をWeb上で簡単に作成・シェアできます。
          </p>
        </div>

        <TamegakiPreview initialParams={params} />

        <footer className="text-center text-stone-500 text-sm py-4">
          このサイトは、<a href="https://x.com/ninofku" target="_blank" rel="noreferrer" className="underline hover:text-stone-800 transition-colors">ほづみゆうき</a>が作成したものです。
        </footer>
      </div>
    </main>
  );
}
