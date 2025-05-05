import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm } from 'formidable';
import { createReadStream } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const FOLDER_ID = '1yyzmQoolF6E7adWBprt5EH1ouDVh9Ps9'; // Replace with your actual Google Drive folder ID

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/callback`
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const accessToken = req.cookies.access_token;
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: client });

    const response = await drive.files.create({
      requestBody: {
        name: file.originalFilename,
        mimeType: file.mimetype,
        parents: [FOLDER_ID], // Specify the folder ID here
      },
      media: {
        mimeType: file.mimetype,
        body: createReadStream(file.filepath),
      },
    });

    res.status(200).json({ fileId: response.data.id });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}