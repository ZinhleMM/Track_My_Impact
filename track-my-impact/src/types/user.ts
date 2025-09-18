export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  location?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}
