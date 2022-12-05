export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      modules: {
        Row: {
          id: string;
          created_at: string;
          edited_at: string | null;
          name: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          edited_at?: string | null;
          name: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          edited_at?: string | null;
          name?: string;
          user_id?: string;
        };
      };
      sources: {
        Row: {
          id: string;
          created_at: string | null;
          label: string;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          label?: string;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          label?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
