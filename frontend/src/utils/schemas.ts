import { z } from "zod";

// Basic claim schema matching your CSV structure
export const claimSchema = z.object({
  "Claim ID": z.string().min(1, "Claim ID is required"),
  "Subscriber ID": z.string().min(1, "Subscriber ID is required"),
  "Member Sequence": z.string(),
  "Claim Status": z.string(),
  "Billed": z.string().regex(/^\d+(\.\d{2})?$/, "Invalid billed amount format"),
  "Allowed": z.string().regex(/^\d+(\.\d{2})?$/, "Invalid allowed amount format"),
  "Paid": z.string().regex(/^\d+(\.\d{2})?$/, "Invalid paid amount format"),
  "Service Date": z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid service date format"),
  "Provider ID": z.string(),
  "Provider Name": z.string().min(1, "Provider name is required"),
  "Place of Service": z.string(),
  "Claim Type": z.string(),
  "Procedure Code": z.string(),
  "Member Gender": z.string(),
});

export type Claim = z.infer<typeof claimSchema>;

// Schema for array of claims
export const claimsArraySchema = z.array(claimSchema);