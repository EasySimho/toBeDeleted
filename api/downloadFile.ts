import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { VercelRequest, VercelResponse } from '@vercel/node';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/callback`
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { fileId } = req.query;

  if (!fileId) {
    return res.status(400).json({ error: 'File ID is required' });
  }

  try {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: client });

    const file = await drive.files.get({
      fileId: fileId as string,
      alt: 'media',
    }, { responseType: 'stream' });

    res.setHeader('Content-Type', file.headers['content-type']);
    res.setHeader('Content-Disposition', `attachment; filename="${fileId}"`);

    file.data.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}