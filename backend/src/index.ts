import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { z } from "zod";

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', prettyJSON());

// Schema for claims validation
const claimSchema = z.object({
  "Claim ID": z.string(),
  "Subscriber ID": z.string(),
  "Member Sequence": z.string(),
  "Claim Status": z.string(),
  "Billed": z.string(),
  "Allowed": z.string(),
  "Paid": z.string(),
  "Service Date": z.string(),
  "Provider ID": z.string(),
  "Provider Name": z.string(),
  "Place of Service": z.string(),
  "Claim Type": z.string(),
  "Procedure Code": z.string(),
  "Member Gender": z.string(),
});

// Store claims in memory for development
let pendingClaims: any[] = [];
let approvedClaims: any[] = [];
let mrfFiles: any[] = [];

app.post('/upload', async (c) => {
  const body = await c.req.json();
  
  try {
    const validatedClaims = z.array(claimSchema).parse(body);
    pendingClaims = [...pendingClaims, ...validatedClaims];
    return c.json({ success: true, count: validatedClaims.length });
  } catch (error) {
    return c.json({ success: false, error: 'Invalid claims data' }, 400);
  }
});

app.get('/claims', (c) => {
  return c.json(pendingClaims);
});

app.post('/claims/approve', async (c) => {
  const body = await c.req.json();
  const { claimIds } = body;

  // Move approved claims to approvedClaims array
  const newlyApprovedClaims = pendingClaims.filter(claim => claimIds.includes(claim["Claim ID"]));
  approvedClaims = [...approvedClaims, ...newlyApprovedClaims];
  
  // Remove approved claims from pending
  pendingClaims = pendingClaims.filter(claim => !claimIds.includes(claim["Claim ID"]));

  // Generate MRF file if we have enough claims or it's end of day
  if (approvedClaims.length >= 10 || shouldGenerateMrf()) {
    const mrfFile = {
      id: Date.now(),
      name: `MRF_${new Date().toISOString().split('T')[0]}.json`,
      claims: [...approvedClaims], // Create a copy of approved claims
      createdAt: new Date().toISOString(),
      size: `${Math.round(JSON.stringify(approvedClaims).length / 1024)} KB`
    };

    mrfFiles.push(mrfFile);
    approvedClaims = []; // Clear approved claims after generating MRF
    
    return c.json({ success: true, mrfFile });
  }

  return c.json({ 
    success: true, 
    message: 'Claims approved and pending MRF generation',
    approvedCount: approvedClaims.length
  });
});

app.post('/claims/reject', async (c) => {
  const body = await c.req.json();
  const { claimIds } = body;

  // Simply remove rejected claims from pending
  pendingClaims = pendingClaims.filter(claim => !claimIds.includes(claim["Claim ID"]));

  return c.json({ 
    success: true, 
    message: 'Claims rejected'
  });
});

app.get('/mrf', (c) => {
  return c.json(mrfFiles);
});

app.get('/mrf/:id', (c) => {
  const id = Number(c.req.param('id'));
  const mrfFile = mrfFiles.find(file => file.id === id);
  
  if (mrfFile) {
    return c.json(mrfFile);
  }
  
  return c.json({ error: 'MRF file not found' }, 404);
});

// Helper function to determine if we should generate an MRF file
// In production, this might check for end of day or other business rules
function shouldGenerateMrf(): boolean {
  // For demo purposes, generate MRF if it's been more than an hour since the last one
  const lastMrf = mrfFiles[mrfFiles.length - 1];
  if (!lastMrf) return true;
  
  const hoursSinceLastMrf = (Date.now() - lastMrf.id) / (1000 * 60 * 60);
  return hoursSinceLastMrf >= 1;
}

// Start the server
const port = 8080;
serve({
  fetch: app.fetch,
  port
});

console.log(`Server is running on http://localhost:${port}`);
