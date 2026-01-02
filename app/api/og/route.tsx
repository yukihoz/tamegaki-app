import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const name = searchParams.get('name') || '候補者名';
        const sender = searchParams.get('sender') || '贈呈者名';
        const message = searchParams.get('message');
        const imageParam = searchParams.get('image') || 'user-tamegaki.png';
        const fontParam = searchParams.get('font') || 'var(--font-shippori-mincho)';
        const colorParam = searchParams.get('color') || '#ffffff';

        // Map font variable to URL and name
        let fontUrl = 'https://github.com/google/fonts/raw/main/ofl/shipporimincho/ShipporiMincho-ExtraBold.ttf';
        let fontName = 'Shippori Mincho';
        let fontWeight = 900;

        if (fontParam === 'var(--font-noto-sans-jp)') {
            fontUrl = 'https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP-Black.ttf';
            fontName = 'Noto Sans JP';
            fontWeight = 900;
        } else if (fontParam === 'var(--font-yuji-syuku)') {
            fontUrl = 'https://github.com/google/fonts/raw/main/ofl/yujisyuku/YujiSyuku-Regular.ttf';
            fontName = 'Yuji Syuku';
            fontWeight = 400;
        } else if (fontParam === 'var(--font-zen-antique)') {
            fontUrl = 'https://github.com/google/fonts/raw/main/ofl/zenantique/ZenAntique-Regular.ttf';
            fontName = 'Zen Antique';
            fontWeight = 400;
        }

        // Font loading
        const fontData = await fetch(new URL(fontUrl, import.meta.url)).then((res) => res.arrayBuffer());

        // Base Image loading
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;
        // Ensure we only load allowed images to prevent arbitrary file access
        const allowedImages = ['user-tamegaki.png', 'image2.png', 'image3.png', 'image4.png'];
        const imageFile = allowedImages.includes(imageParam) ? imageParam : 'user-tamegaki.png';
        const imageUrl = `${baseUrl}/${imageFile}`;

        const imageData = await fetch(imageUrl).then((res) => res.arrayBuffer());

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        backgroundColor: colorParam, // Set background color for tinting
                    }}
                >
                    {/* Background Image */}
                    {/* Note: mix-blend-mode support in satori is limited. 
                        If this doesn't work, we might need to rely on the image being transparent or use a different technique.
                        However, for opaque black/white images, multiply should work if supported. 
                        If not supported, the background color will just be hidden by the opaque image.
                    */}
                    <img
                        src={imageUrl}
                        alt="Background"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            mixBlendMode: 'multiply', // Attempt to use multiply blend mode
                        }}
                    />

                    {/* Content Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '64px',
                            color: 'black',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', height: '100%', maxWidth: '1000px', margin: '0 auto', paddingTop: '120px', paddingBottom: '120px', paddingRight: '120px', paddingLeft: '120px' }}>

                            {/* Candidate Name - Right side (Absolute Position) */}
                            <div style={{
                                position: 'absolute',
                                right: '100px', // Anchored right
                                top: '150px',
                                display: 'flex',
                                flexDirection: 'row', // T-to-B in vertical-rl
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                writingMode: 'vertical-rl',
                            }}>
                                <h1 style={{ fontSize: '64px', fontFamily: `"${fontName}"`, fontWeight: fontWeight, letterSpacing: '0.1em', lineHeight: '1.1', margin: 0 }}>
                                    {name}
                                </h1>
                                <div style={{ marginTop: '32px', fontSize: '40px', fontFamily: `"${fontName}"` }}>殿</div>
                            </div>

                            {/* Message - Middle (Absolute Position) */}
                            <div style={{
                                position: 'absolute',
                                right: '882px', // Anchored right (Moved 30px left from 852px)
                                top: '400px',
                                height: '900px', // Constrain height
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap',
                                writingMode: 'vertical-rl',
                            }}>
                                {message && (
                                    <p style={{ fontSize: '29px', fontFamily: `"${fontName}"`, fontWeight: 'bold', whiteSpace: 'pre-wrap', textAlign: 'center', letterSpacing: '0.1em', lineHeight: '34px', maxHeight: '100%' }}>
                                        {message}
                                    </p>
                                )}
                            </div>

                            {/* Sender Name - Left side (Absolute Position) */}
                            <div style={{
                                position: 'absolute',
                                right: '1032px', // Anchored right
                                top: '700px',
                                display: 'flex',
                                flexDirection: 'column', // R-to-L in vertical-rl
                                alignItems: 'flex-end',
                                justifyContent: 'flex-start',
                                writingMode: 'vertical-rl',
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <p style={{ fontSize: '48px', fontFamily: `"${fontName}"`, fontWeight: 'bold', letterSpacing: '0.05em' }}>
                                        {sender}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 1500,
                fonts: [
                    {
                        name: fontName,
                        data: fontData,
                        style: 'normal',
                        weight: fontWeight as any,
                    },
                ],
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
