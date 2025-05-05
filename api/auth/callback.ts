import { OAuth2Client } from 'google-auth-library';
import { VercelRequest, VercelResponse } from '@vercel/node';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/callback`
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  try {
    const { tokens } = await client.getToken(code as string);
    
    // In a production environment, you would store these tokens securely
    // For now, we'll set them in cookies
    res.setHeader('Set-Cookie', [
      `access_token=${tokens.access_token}; HttpOnly; Path=/; Max-Age=3600`,
      `refresh_token=${tokens.refresh_token}; HttpOnly; Path=/; Max-Age=2592000`
    ]);

    res.redirect('/');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).json({ error: 'Failed to get tokens' });
  }
}