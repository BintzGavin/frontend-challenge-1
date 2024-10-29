import type { Claim } from "~/utils/schemas";

const API_BASE_URL = 'http://localhost:8080';

export const api = {
  async uploadClaims(claims: Claim[]) {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(claims),
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload claims');
    }
    
    return response.json();
  },

  async getClaims() {
    const response = await fetch(`${API_BASE_URL}/claims`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch claims');
    }
    
    return response.json();
  },

  async approveClaims(claimIds: string[]) {
    const response = await fetch(`${API_BASE_URL}/claims/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claimIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to approve claims');
    }
    
    return response.json();
  },

  async getMrfFiles() {
    const response = await fetch(`${API_BASE_URL}/mrf`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch MRF files');
    }
    
    return response.json();
  },

  async getMrfFile(id: number) {
    const response = await fetch(`${API_BASE_URL}/mrf/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch MRF file');
    }
    
    return response.json();
  },

  async rejectClaims(claimIds: string[]) {
    const response = await fetch(`${API_BASE_URL}/claims/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claimIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject claims');
    }
    
    return response.json();
  },
}; 