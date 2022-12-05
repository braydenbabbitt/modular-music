export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      module_sources: {
        Row: {
          id: string;
          type_id: string;
          playlist_id: string | null;
          href: string | null;
          created_at: string;
          module_id: string;
          image_href: string | null;
          label: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          type_id: string;
          playlist_id?: string | null;
          href?: string | null;
          created_at?: string;
          module_id: string;
          image_href?: string | null;
          label?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          type_id?: string;
          playlist_id?: string | null;
          href?: string | null;
          created_at?: string;
          module_id?: string;
          image_href?: string | null;
          label?: string | null;
          deleted_at?: string | null;
        };
      };
      modules: {
        Row: {
          id: string;
          created_at: string;
          edited_at: string | null;
          name: string;
          user_id: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          edited_at?: string | null;
          name: string;
          user_id: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          edited_at?: string | null;
          name?: string;
          user_id?: string;
          deleted_at?: string | null;
        };
      };
      source_types: {
        Row: {
          id: string;
          created_at: string | null;
          label: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          label?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          label?: string;
          deleted_at?: string | null;
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
