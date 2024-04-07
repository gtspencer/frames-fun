/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { pinata } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  hub: pinata()
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/', (c) => {
  return c.res({
    action: '/hattip',
    image: `/images/hat_logo.jpg`,
    imageAspectRatio: "1:1",
    intents: [
      <Button>Tip your hat</Button>,
    ],
  })
})

app.frame('/hattip', (c) => {
  const { verified, frameData } = c

  if (!verified) {
    return ReturnUnverified(c)
  }

  const { fid } = frameData || {}
  console.log(fid)
  console.log(frameData)
  return c.res({
    image: `/images/banner.jpg`,
  })
})

function ReturnUnverified(c: any) {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        > Please login to Farcaster!
        </div>
      </div>
    ),
  })
}

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
