import { OAuth2Client } from 'google-auth-library';
import { VercelRequest, VercelResponse } from '@vercel/node';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/callback`
);

export default function handler(req: VercelRequest, res: VercelResponse) {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  });

  res.redirect(authUrl);
}