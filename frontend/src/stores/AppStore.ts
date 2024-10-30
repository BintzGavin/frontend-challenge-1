import { makeAutoObservable, runInAction } from "mobx";
import type { Claim } from "~/utils/schemas";
import { api } from "~/services/api";

class AppStore {
  claims: Claim[] = [];
  approvedClaims: Claim[] = [];
  rejectedClaims: Claim[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async setClaims(claims: Claim[]) {
    try {
      this.isLoading = true;
      await api.uploadClaims(claims);
      runInAction(() => {
        this.claims = claims;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to upload claims';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async approveSelectedClaims(claims: Claim[]) {
    try {
      this.isLoading = true;
      const claimIds = claims.map(claim => claim["Claim ID"]);
      await api.approveClaims(claimIds);
      runInAction(() => {
        this.approvedClaims.push(...claims);
        this.claims = this.claims.filter(c => !claimIds.includes(c["Claim ID"]));
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to approve claims';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async rejectSelectedClaims(claims: Claim[]) {
    try {
      this.isLoading = true;
      const claimIds = claims.map(claim => claim["Claim ID"]);
      await api.rejectClaims(claimIds);
      runInAction(() => {
        this.rejectedClaims.push(...claims);
        this.claims = this.claims.filter(c => !claimIds.includes(c["Claim ID"]));
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to reject claims';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  get pendingClaimsCount() {
    return this.claims.length;
  }

  get approvedClaimsCount() {
    return this.approvedClaims.length;
  }

  get rejectedClaimsCount() {
    return this.rejectedClaims.length;
  }
}

export const appStore = new AppStore();