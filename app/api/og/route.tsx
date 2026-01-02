import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const name = searchParams.get('name') || '候補者名';
        const sender = searchParams.get('sender') || '贈呈者名';
        const nameTitle = searchParams.get('nameTitle');
        const senderTitle = searchParams.get('senderTitle');
        const senderImage = searchParams.get('senderImage');
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
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : new URL(req.url).origin;

        // Ensure we only load allowed images to prevent arbitrary file access
        const allowedImages = ['1.png', '2.png', '3.png', '4.png', '5.png'];
        const imageFile = allowedImages.includes(imageParam) ? imageParam : '1.png';
        const imageUrl = `${baseUrl}/${imageFile}`;

        let imageSrc = imageUrl;
        try {
            const res = await fetch(imageUrl);
            if (!res.ok) {
                console.error(`Failed to fetch image: ${res.status} ${res.statusText}`);
                throw new Error(`Failed to fetch image`);
            }
            const buffer = await res.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            imageSrc = `data:image/png;base64,${base64}`;
        } catch (e: any) {
            console.error('Error fetching image fallback:', e);
            // If fetch fails, we keep imageSrc as URL and hope satori can resolve it,
            // or we could throw. But logging is key.
        }

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
                        src={imageSrc}
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

                            {/* Candidate Title - Right of Name */}
                            {nameTitle && (
                                <div style={{
                                    position: 'absolute',
                                    right: '0px', // Moved to 0px from 10px
                                    top: '170px', // Moved 20px DOWN from 150px
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    writingMode: 'vertical-rl',
                                    whiteSpace: 'nowrap',
                                }}>
                                    <p style={{ fontSize: '38px', fontFamily: `"${fontName}"`, fontWeight: 'bold', margin: 0, letterSpacing: '0.1em' }}>
                                        {nameTitle}
                                    </p>
                                </div>
                            )}

                            {/* Candidate Name - Right side (Absolute Position) */}
                            <div style={{
                                position: 'absolute',
                                right: '100px', // Changed from 110px to 100px
                                top: '250px', // Moved 100px DOWN from 150px
                                display: 'flex',
                                flexDirection: 'row', // T-to-B in vertical-rl
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                writingMode: 'vertical-rl',
                            }}>
                                <h1 style={{ fontSize: '52px', fontFamily: `"${fontName}"`, fontWeight: fontWeight, letterSpacing: '0.1em', lineHeight: '1.1', margin: 0 }}>
                                    {name}
                                </h1>
                                <div style={{ marginTop: '32px', fontSize: '40px', fontFamily: `"${fontName}"` }}>殿</div>
                            </div>

                            {/* Message - Bottom Right (Absolute Position, Horizontal) */}
                            <div style={{
                                position: 'absolute',
                                right: '0px',
                                top: '1410px',
                                width: '1200px', // Full width
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start', // Align text to the left
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap',
                            }}>
                                {message && (
                                    <p style={{ fontSize: '18px', fontFamily: `"${fontName}"`, fontWeight: 'bold', whiteSpace: 'pre-wrap', textAlign: 'left', letterSpacing: '0.1em', lineHeight: '24px' }}>
                                        {message}
                                    </p>
                                )}
                            </div>

                            {/* Sender Title - Right of Sender Name */}
                            {senderTitle && (
                                <div style={{
                                    position: 'absolute',
                                    right: '960px', // Adjusted to 960px for ~50px gap from Sender Name (1052px)
                                    top: '540px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start', // Align Top
                                    justifyContent: 'flex-start',
                                    writingMode: 'vertical-rl',
                                    whiteSpace: 'nowrap',
                                }}>
                                    <p style={{ fontSize: '31px', fontFamily: `"${fontName}"`, fontWeight: 'bold', margin: 0, letterSpacing: '0.1em' }}>
                                        {senderTitle}
                                    </p>
                                </div>
                            )}

                            {/* Sender Image - Above Sender Name */}
                            {senderImage && (
                                <div style={{
                                    position: 'absolute',
                                    right: '952px', // Moved 100px RIGHT from 1052px
                                    top: '230px', // Moved 50px DOWN from 180px
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '200px',
                                    height: '200px',
                                }}>
                                    <img
                                        src={senderImage}
                                        alt="Sender"
                                        style={{
                                            width: '200px',
                                            height: '200px',
                                            objectFit: 'cover',
                                            borderRadius: '50%', // Circle crop
                                        }}
                                    />
                                </div>
                            )}

                            {/* Sender Name - Left side (Absolute Position) */}
                            <div style={{
                                position: 'absolute',
                                right: '1052px',
                                top: '630px', // Moved 100px UP from 730px
                                display: 'flex',
                                flexDirection: 'column', // R-to-L in vertical-rl
                                alignItems: 'flex-start', // Align Top
                                justifyContent: 'flex-start',
                                writingMode: 'vertical-rl',
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <p style={{ fontSize: '40px', fontFamily: `"${fontName}"`, fontWeight: 'bold', letterSpacing: '0.05em' }}>
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
