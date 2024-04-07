import { ImageResponse } from 'next/og'
// App router includes @vercel/og.
// No need to install it.

export const runtime = 'edge'

function extractNumbersAndBoolean(inputString: string) {
    let number = '';
    let boolValue = '';
    let foundNumber = false;
    let foundBoolValue = false;

    // Iterate through each character of the input string
    for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];

        // If the character is a digit and number hasn't been found yet
        if (!foundNumber) {
            number += char;
        }
        // If the character is 'true' or 'false' and boolean value hasn't been found yet
        else if ((char === 't' || char === 'f') && !foundBoolValue) {
            if (inputString.substring(i, i + 4) === 'true') {
                boolValue = 'true';
                foundBoolValue = true;
                i += 3; // Skip ahead to avoid rechecking 'true' characters
            } else if (inputString.substring(i, i + 5) === 'false') {
                boolValue = 'false';
                foundBoolValue = true;
                i += 4; // Skip ahead to avoid rechecking 'false' characters
            }
        }
        // If both number and boolean value have been found, break the loop
        if (foundNumber && foundBoolValue) {
            break;
        }
    }

    // Return the extracted values
    return { number, boolValue };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    console.log('in image page')
    console.log(request.url)

    const hasTips = searchParams.has('hattips')
    const tips = hasTips ? searchParams.get('hattips') : ""

    const hasAlreadyTippedToday = searchParams.has('alreadyTippedToday')
    const alreadyTippedToday = hasAlreadyTippedToday ? searchParams.get('alreadyTippedToday') : ""

    console.log('tips ' + tips)
    console.log('has tipped already ' + alreadyTippedToday)

    const imageData = await fetch(
        new URL('./hat_logo_text.jpg', import.meta.url)
    ).then((res) => res.arrayBuffer())

    let responseMessage = ""
    if (tips == "1") {
        responseMessage = "Your first hat tip!  Come back tomorrow for more."
    } else {
        if (alreadyTippedToday == 'true' || alreadyTippedToday === 'true') {
            responseMessage = `You have already tipped your hat today.\nTotal hat tips: ${tips}\nCome back tomorrow for more`
        } else {
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