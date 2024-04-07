import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    const hasTips = searchParams.has('hattips')
    const tips = hasTips ? searchParams.get('hattips') : ""

    const hasTippedToday = searchParams.has('amp;tippedToday')
    const tippedToday = searchParams.get('amp;tippedToday')

    console.log('here')
    const imageData = await fetch(
        new URL('./hat_logo_text.jpg', import.meta.url)
    ).then((res) => res.arrayBuffer())
    console.log('here2')

    let responseMessage = ""
    if (tips == "1") {
        responseMessage = "Your first hat tip!  Come back tomorrow for more."
    } else {
        console.log(tippedToday)
        if (tippedToday == "false") {
            console.log('already tipped')
            responseMessage = `You have already tipped your hat today.\nTotal hat tips: ${tips}\nCome back tomorrow for more`
            
        } else {
            console.log('new tip!')
            responseMessage = `Hat tipped!\nTotal hat tips: ${tips}\nCome back tomorrow for more`
        }
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
                <img width="630" height="630" alt="hat stays on" src={imageData} />
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
        )
    )
}