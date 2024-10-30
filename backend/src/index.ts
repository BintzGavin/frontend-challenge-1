import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { z } from "zod";

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', prettyJSON());

// MRF Schema Validation
const tinSchema = z.object({
  type: z.enum(["ein", "npi"]),
  value: z.string()
});

const providerSchema = z.object({
  billed_charge: z.number(),
  npi: z.array(z.string())
});

const paymentSchema = z.object({
  allowed_amount: z.number(),
  billing_code_modifier: z.array(z.string()).optional(),
  providers: z.array(providerSchema)
});

const allowedAmountSchema = z.object({
  tin: tinSchema,
  service_code: z.array(z.string()).optional(),
  billing_class: z.enum(["professional", "institutional"]),
  payments: z.array(paymentSchema)
});

const outOfNetworkItemSchema = z.object({
  name: z.string(),
  billing_code_type: z.string(),
  billing_code: z.string(),
  billing_code_type_version: z.string(),
  description: z.string(),
  allowed_amounts: z.array(allowedAmountSchema)
});

const mrfSchema = z.object({
  reporting_entity_name: z.string(),
  reporting_entity_type: z.string(),
  plan_name: z.string().optional(),
  plan_id_type: z.enum(["EIN", "HIOS"]).optional(),
  plan_id: z.string().optional(),
  plan_market_type: z.enum(["group", "individual"]).optional(),
  out_of_network: z.array(outOfNetworkItemSchema),
  last_updated_on: z.string(),
  version: z.string()
});

// Store claims in memory for development
let pendingClaims: any[] = [];
let approvedClaims: any[] = [];
let mrfFiles: any[] = [];

// Helper function to transform claims into MRF format
function transformClaimsToMRF(claims: any[]) {
  try {
    type GroupedClaims = {
      [key: string]: any[];
    };

    const groupedClaims = claims.reduce<GroupedClaims>((acc, claim) => {
      // Group by both procedure code and place of service
      const key = `${claim["Procedure Code"]}_${claim["Provider ID"]}_${claim["Place of Service"]}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(claim);
      return acc;
    }, {});

    const outOfNetwork = Object.entries(groupedClaims).map(([key, claimsGroup]) => {
      const [procedureCode, providerId, placeOfService] = key.split('_');
      const firstClaim = claimsGroup[0];

      // Calculate average allowed amount
      const totalAllowed = claimsGroup.reduce((sum, claim) => sum + parseFloat(claim.Allowed), 0);
      const averageAllowed = totalAllowed / claimsGroup.length;

      // CMS Place of Service Codes
      const serviceCodeMap: { [key: string]: string } = {
        "Office": "11",
        "Home": "12",
        "Mobile Unit": "15",
        "Temporary Lodging": "16",
        "Walk-in Retail Health Clinic": "17",
        "Place of Employment": "18",
        "Outpatient Hospital": "22",
        "Inpatient Hospital": "21",
        "Emergency Room - Hospital": "23",
        "Ambulatory Surgical Center": "24",
        "Birthing Center": "25",
        "Military Treatment Facility": "26",
        "Skilled Nursing Facility": "31",
        "Nursing Facility": "32",
        "Hospice": "34",
        "Ambulance - Land": "41",
        "Ambulance - Air or Water": "42",
        "Independent Clinic": "49",
        "Federally Qualified Health Center": "50",
        "Inpatient Psychiatric Facility": "51",
        "Psychiatric Facility Partial Hospitalization": "52",
        "Community Mental Health Center": "53",
        "Intermediate Care Facility": "54",
        "Residential Substance Abuse Treatment Facility": "55",
        "Psychiatric Residential Treatment Center": "56",
        "Non-residential Substance Abuse Facility": "57",
        "Mass Immunization Center": "60",
        "Comprehensive Inpatient Rehabilitation": "61",
        "Comprehensive Outpatient Rehabilitation": "62",
        "End-Stage Renal Disease Treatment Facility": "65",
        "Public Health Clinic": "71",
        "Rural Health Clinic": "72",
        "Independent Laboratory": "81",
        "Other Place of Service": "99"
      };

      const serviceCode = serviceCodeMap[placeOfService] || "99"; // Default to "Other" if not found

      return {
        name: `${firstClaim["Procedure Code"]} - ${firstClaim["Provider Name"]}`,
        billing_code_type: "CPT",
        billing_code: procedureCode,
        billing_code_type_version: new Date().getFullYear().toString(),
        description: `Healthcare service provided at ${placeOfService}`,
        allowed_amounts: [{
          tin: {
            type: "npi" as const,
            value: providerId
          },
          service_code: [serviceCode],
          billing_class: firstClaim["Claim Type"].toLowerCase() === "professional" ? "professional" as const : "institutional" as const,
          payments: [{
            allowed_amount: Number(averageAllowed.toFixed(2)),
            providers: [{
              billed_charge: Number(parseFloat(firstClaim.Billed).toFixed(2)),
              npi: [providerId]
            }]
          }]
        }]
      };
    });

    const mrfData = {
      reporting_entity_name: "Sample Healthcare Organization",
      reporting_entity_type: "health insurance issuer",
      out_of_network: outOfNetwork,
      last_updated_on: new Date().toISOString().split('T')[0],
      version: "1.0.0"
    };

    // Validate against schema
    const validationResult = mrfSchema.safeParse(mrfData);
    
    if (!validationResult.success) {
      console.error('MRF Validation Errors:', validationResult.error.errors);
      throw new Error('Failed to validate MRF data structure');
    }

    return validationResult.data;

  } catch (error) {
    console.error('Error in transformClaimsToMRF:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation Errors:', error.errors);
    }
    throw new Error('Failed to transform claims to MRF format');
  }
}

// Required endpoints
app.post('/upload', async (c) => {
  const body = await c.req.json();
  
  try {
    pendingClaims = [...pendingClaims, ...body];
    return c.json({ success: true, count: body.length });
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

  try {
    const newlyApprovedClaims = pendingClaims.filter(claim => claimIds.includes(claim["Claim ID"]));
    approvedClaims = [...approvedClaims, ...newlyApprovedClaims];
    pendingClaims = pendingClaims.filter(claim => !claimIds.includes(claim["Claim ID"]));

    if (approvedClaims.length >= 20) {
      const mrfData = transformClaimsToMRF(approvedClaims);
      
      const mrfFile = {
        id: Date.now(),
        name: `MRF_${new Date().toISOString().split('T')[0]}.json`,
        data: mrfData,
        createdAt: new Date().toISOString(),
        size: `${Math.round(JSON.stringify(mrfData).length / 1024)} KB`
      };

      mrfFiles.push(mrfFile);
      approvedClaims = [];
      
      return c.json({ 
        success: true, 
        mrfFile,
        message: 'MRF file generated successfully' 
      });
    }

    return c.json({ 
      success: true, 
      message: 'Claims approved and pending MRF generation',
      approvedCount: approvedClaims.length,
      remainingNeeded: 20 - approvedClaims.length
    });

  } catch (error) {
    console.error('Error processing claims:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process claims',
      details: error instanceof z.ZodError ? error.errors : undefined
    }, 500);
  }
});

app.post('/claims/reject', async (c) => {
  const body = await c.req.json();
  const { claimIds } = body;

  // Remove rejected claims from pending
  pendingClaims = pendingClaims.filter(claim => !claimIds.includes(claim["Claim ID"]));

  return c.json({ 
    success: true, 
    message: 'Claims rejected'
  });
});

app.get('/mrf', (c) => {
  // Map the files to include the data property
  const filesWithData = mrfFiles.map(file => ({
    id: file.id,
    name: file.name,
    createdAt: file.createdAt,
    size: file.size,
    claims: file.data.out_of_network // Include the actual MRF data
  }));
  return c.json(filesWithData);
});

app.get('/mrf/:id', (c) => {
  const id = Number(c.req.param('id'));
  const mrfFile = mrfFiles.find(file => file.id === id);
  
  if (mrfFile) {
    // Return the full MRF data structure
    return c.json({
      id: mrfFile.id,
      name: mrfFile.name,
      createdAt: mrfFile.createdAt,
      size: mrfFile.size,
      claims: mrfFile.data.out_of_network // Include the actual MRF data
    });
  }
  
  return c.json({ error: 'MRF file not found' }, 404);
});

// Start the server
const port = 8080;
serve({
  fetch: app.fetch,
  port
});

console.log(`Server is running on http://localhost:${port}`);
