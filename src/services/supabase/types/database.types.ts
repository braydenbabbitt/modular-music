export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      action_types: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          image_href: string;
          label: string;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          image_href: string;
          label?: string;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          image_href?: string;
          label?: string;
        };
      };
      feature_flags: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          enabled: boolean;
          id: string;
          name: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          enabled: boolean;
          id?: string;
          name?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          enabled?: boolean;
          id?: string;
          name?: string;
          user_id?: string | null;
        };
      };
      module_actions: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          image_href: string;
          label: string;
          module_id: string;
          order: number;
          type_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_href: string;
          label: string;
          module_id: string;
          order?: number;
          type_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_href?: string;
          label?: string;
          module_id?: string;
          order?: number;
          type_id?: string;
        };
      };
      module_outputs: {
        Row: {
          append: boolean | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          image_href: string;
          label: string;
          limit: number;
          module_id: string | null;
          playlist_href: string | null;
          playlist_id: string;
        };
        Insert: {
          append?: boolean | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_href: string;
          label: string;
          limit?: number;
          module_id?: string | null;
          playlist_href?: string | null;
          playlist_id: string;
        };
        Update: {
          append?: boolean | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_href?: string;
          label?: string;
          limit?: number;
          module_id?: string | null;
          playlist_href?: string | null;
          playlist_id?: string;
        };
      };
      module_schedules: {
        Row: {
          edited_at: string;
          end_date: string | null;
          id: string;
          next_run: string;
          repetition: Json | null;
        };
        Insert: {
          edited_at?: string;
          end_date?: string | null;
          id: string;
          next_run: string;
          repetition?: Json | null;
        };
        Update: {
          edited_at?: string;
          end_date?: string | null;
          id?: string;
          next_run?: string;
          repetition?: Json | null;
        };
      };
      module_sources: {
        Row: {
          action_id: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          image_href: string;
          label: string;
          module_id: string | null;
          options: Json | null;
          type_id: string;
        };
        Insert: {
          action_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_href: string;
          label: string;
          module_id?: string | null;
          options?: Json | null;
          type_id: string;
        };
        Update: {
          action_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          image_href?: string;
          label?: string;
          module_id?: string | null;
          options?: Json | null;
          type_id?: string;
        };
      };
      modules: {
        Row: {
          complete: boolean;
          created_at: string;
          deleted_at: string | null;
          edited_at: string | null;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          complete?: boolean;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          complete?: boolean;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          id?: string;
          name?: string;
          user_id?: string;
        };
      };
      newsletter_signups: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          unsubscribed_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          unsubscribed_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          unsubscribed_at?: string | null;
        };
      };
      source_types: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          image_href: string | null;
          label: string;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          image_href?: string | null;
          label?: string;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          image_href?: string | null;
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
