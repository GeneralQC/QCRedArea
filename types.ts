
export interface LabEntry {
  id: string;
  date: string;
  contactPerson: string;
  fullName: string;
  activity: string;
  entryTime: string;
  exitTime: string;
  status: 'In' | 'Out';
  signature: string; // Base64 string of signature
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: number;
  createdAt: number;
}

export interface EntryStats {
  totalToday: number;
  currentlyIn: number;
  totalThisMonth: number;
}
