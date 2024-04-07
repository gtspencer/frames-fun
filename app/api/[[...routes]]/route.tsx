/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { pinata } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { sql } from '@vercel/postgres';

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
    image: `${process.env.NEXT_PUBLIC_SITE_URL}/images/hat_logo.jpg`,
    imageAspectRatio: "1:1",
    intents: [
      <Button>Tip your hat</Button>,
    ],
  })
})

app.frame('/hattip', async (c) => {
  console.log('here')
  const { verified, frameData } = c

  if (!verified) {
    return ReturnUnverified(c, "Please login to Farcaster")
  }

  const { fid } = frameData || {}
  
  if (!fid) {
    return ReturnUnverified(c, "Unable to resolve FID . . .")
  }

  const day = new Date();
  const currentDate = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()))

  console.log('Checking hat tips...')
  const resp = await getHatTips(fid)
  let tipCount = 1;
  let tippedToday = false
  if (resp.rowCount <= 0) {
    tippedToday = true
    console.log('no tips, making some')
    const insertResp = await insertNewFid(fid)
  } else {
    tipCount = resp.rows[0].hattips

    const lastTip = new Date(Date.UTC(resp.rows[0].lasttipyear, resp.rows[0].lasttipmonth, resp.rows[0].lasttipday))
    
    const ticksInDay = 24 * 60 * 60 * 1000;
    if (lastTip.getTime() + ticksInDay <= currentDate.getTime()) {
      // can tip
      tippedToday = true
      tipCount++
      updateHatTips(fid)
      
    } else {
      
      // cannot tip
      console.log('already tipped today')
    }
  }

  console.log('tip count ' + tipCount)

  const newSearchParams = new URLSearchParams({
    hattips: tipCount.toString(),
    tippedToday: tippedToday.toString()
  })

  return c.res({
      image: `${process.env.NEXT_PUBLIC_SITE_URL}/hattip?${newSearchParams}`,
      imageAspectRatio: "1:1",
    })

  // return c.res({
  //   image: `${process.env.NEXT_PUBLIC_SITE_URL}/images/hat_logo_text.jpg`,
  //   imageAspectRatio: "1:1",
  // })
})

async function getHatTips(fid: number) {
  const fidString = fid.toString()
  const resp = await sql`
  SELECT hattippers.fid, hattippers.hattips, hattippers.lasttipyear, hattippers.lasttipmonth, hattippers.lasttipday
  FROM hattippers
  WHERE fid = ${fidString};`
  return resp
}

async function insertNewFid(fid: number) {
  const fidString = fid.toString()

  const day = new Date();
  await sql`
  INSERT INTO hattippers (fid, hattips, lasttipyear, lasttipmonth, lasttipday)
  VALUES (${fidString}, ${1}, ${day.getUTCFullYear()}, ${day.getUTCMonth()}, ${day.getUTCDate()});`;
} 

async function updateHatTips(fid: number) {
  const fidString = fid.toString()
  const day = new Date()

  await sql`
  UPDATE hattippers
  SET hattips = hattips + 1, lasttipyear = ${day.getUTCFullYear()}, lasttipmonth = ${day.getUTCMonth()}, lasttipday = ${day.getUTCDate()}
  WHERE fid = ${fidString};`
}

function ReturnUnverified(c: any, message: string) {
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
        > `${message}`
        </div>
      </div>
    ),
  })
}

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
