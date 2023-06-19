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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'feature_flags_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'module_actions_module_id_fkey';
            columns: ['module_id'];
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'module_actions_type_id_fkey';
            columns: ['type_id'];
            referencedRelation: 'action_types';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'module_outputs_module_id_fkey';
            columns: ['module_id'];
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
        ];
      };
      module_runs_log: {
        Row: {
          error: boolean | null;
          id: string;
          module_id: string;
          scheduled: boolean;
          timestamp: string;
        };
        Insert: {
          error?: boolean | null;
          id?: string;
          module_id: string;
          scheduled?: boolean;
          timestamp?: string;
        };
        Update: {
          error?: boolean | null;
          id?: string;
          module_id?: string;
          scheduled?: boolean;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'module_runs_log_module_id_fkey';
            columns: ['module_id'];
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
        ];
      };
      module_schedules: {
        Row: {
          deleted_at: string | null;
          edited_at: string;
          end_date: string | null;
          has_cron_job: boolean;
          id: string;
          next_run: string | null;
          repetition_config: Json | null;
          times_to_repeat: number | null;
        };
        Insert: {
          deleted_at?: string | null;
          edited_at?: string;
          end_date?: string | null;
          has_cron_job?: boolean;
          id: string;
          next_run?: string | null;
          repetition_config?: Json | null;
          times_to_repeat?: number | null;
        };
        Update: {
          deleted_at?: string | null;
          edited_at?: string;
          end_date?: string | null;
          has_cron_job?: boolean;
          id?: string;
          next_run?: string | null;
          repetition_config?: Json | null;
          times_to_repeat?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'module_schedules_id_fkey';
            columns: ['id'];
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'module_sources_action_id_fkey';
            columns: ['action_id'];
            referencedRelation: 'module_actions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'module_sources_module_id_fkey';
            columns: ['module_id'];
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'module_sources_type_id_fkey';
            columns: ['type_id'];
            referencedRelation: 'source_types';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'modules_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [];
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
        Relationships: [];
      };
      user_oauth_tokens: {
        Row: {
          created_at: string;
          provider: string;
          provider_refresh_token: string;
          provider_token: string;
          provider_token_expires_at: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          provider?: string;
          provider_refresh_token: string;
          provider_token: string;
          provider_token_expires_at: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          provider?: string;
          provider_refresh_token?: string;
          provider_token?: string;
          provider_token_expires_at?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_oauth_tokens_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users_spotify_recently_played_cursors: {
        Row: {
          after: number | null;
          id: string;
          last_fetched_at: string | null;
          oldest_played_at: string | null;
        };
        Insert: {
          after?: number | null;
          id: string;
          last_fetched_at?: string | null;
          oldest_played_at?: string | null;
        };
        Update: {
          after?: number | null;
          id?: string;
          last_fetched_at?: string | null;
          oldest_played_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_spotify_recently_played_cursors_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users_spotify_recently_played_items: {
        Row: {
          id: string;
          played_at: string;
          track_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          played_at: string;
          track_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          played_at?: string;
          track_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_spotify_recently_played_items_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'buckets_owner_fkey';
            columns: ['owner'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [];
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
          version: string | null;
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
          version?: string | null;
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
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'objects_owner_fkey';
            columns: ['owner'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
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
        Returns: unknown;
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
