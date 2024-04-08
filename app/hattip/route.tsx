import { ImageResponse } from 'next/og'
// App router includes @vercel/og.
// No need to install it.

export const runtime = 'edge'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    console.log('in image page')
    console.log(request.url)

    const hasTips = searchParams.has('hattips')
    const tips = hasTips ? searchParams.get('hattips') : ""

    const hasAlreadyTippedToday = searchParams.has('alreadyTippedToday')
    let alreadyTippedToday = searchParams.get('alreadyTippedToday')

    if (!alreadyTippedToday) {
        alreadyTippedToday = searchParams.get('amp%3BalreadyTippedToday')
    }

    if (!alreadyTippedToday) {
        alreadyTippedToday = searchParams.get('amp;alreadyTippedToday')
    }

    console.log('tips ' + tips)
    console.log('has tipped already ' + alreadyTippedToday)

    const imageData = await fetch(
        new URL('./hat_logo_text.jpg', import.meta.url)
    ).then((res) => res.arrayBuffer())

    let responseMessage = ""
    if (alreadyTippedToday == 'true' || alreadyTippedToday === 'true') {
        responseMessage = `You have already tipped your hat today.\nTotal hat tips: ${tips}\nCome back tomorrow for more`
    } else {
        responseMessage = `Hat tipped!\nTotal hat tips: ${tips}\nCome back tomorrow for more`
    }

    return new ImageResponse(
        (
        <div
            style={{
                display: 'flex',
                background: '#f6f6f6',
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            {/* @ts-ignore */}
            <img width="630" height="630" alt="meme" src={imageData} />
            <p
                    style={{
                        position: "absolute",
                        color: '#ffffff',
                        fontSize: 30,
                        textAlign: 'center',
                        textAnchor: 'middle',
                        whiteSpace: 'pre-line'
                    }}
                >
              {responseMessage}
            </p>
          </div>
        ),
        {
          width: 630,
          height: 630
        }
      )
}