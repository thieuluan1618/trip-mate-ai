import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

function loadVertexCredentials() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return;
  }
  const credPath = path.resolve(process.cwd(), 'vertex-ai-client.json');
  if (fs.existsSync(credPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
  }
}

function getProjectId(): string {
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    return process.env.GOOGLE_CLOUD_PROJECT;
  }
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const creds = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    return creds.project_id;
  }
  throw new Error('No GOOGLE_CLOUD_PROJECT or GOOGLE_APPLICATION_CREDENTIALS set');
}

loadVertexCredentials();

const project = getProjectId();
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

export const genaiClient = new GoogleGenAI({
  vertexai: true,
  project,
  location,
});

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
