import Papa from "papaparse";
import { claimsArraySchema, type Claim } from "~/utils/schemas";
import { z } from "zod";

interface ParseResult {
  data: Claim[];
  errors: string[];
  totalRows: number;
}

export const parseAndValidateCsv = (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Ensure headers match exactly with our schema
        return header.trim();
      },
      complete: (results) => {
        const errors: string[] = [];
        const totalRows = results.data.length;
        
        // Check for Papa parse errors
        if (results.errors.length > 0) {
          errors.push(...results.errors.map(err => 
            `Row ${err.row + 1}: ${err.message}`
          ));
        }

        try {
          // Attempt to validate the data with Zod
          const validatedData = claimsArraySchema.parse(results.data);
          resolve({ 
            data: validatedData, 
            errors,
            totalRows 
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            // Format Zod validation errors with row numbers when possible
            const validationErrors = error.errors.map(err => {
              const path = err.path.join('.');
              const row = err.path[0] ? Number(err.path[0]) + 2 : '?'; // +2 for header row and 1-based indexing
              return `Row ${row}: ${path} - ${err.message}`;
            });
            errors.push(...validationErrors);
          } else {
            errors.push('An unexpected error occurred while validating the data');
          }
          resolve({ 
            data: [], 
            errors,
            totalRows 
          });
        }
      },
      error: (error) => {
        resolve({ 
          data: [], 
          errors: [error.message],
          totalRows: 0
        });
      },
    });
  });
}; 