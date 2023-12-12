export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
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
          label: string;
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
            isOneToOne: false;
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
            isOneToOne: false;
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'module_actions_type_id_fkey';
            columns: ['type_id'];
            isOneToOne: false;
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
            isOneToOne: true;
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
            isOneToOne: false;
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
          module_id: string;
          next_run: string | null;
          repetition_config: Json | null;
          times_to_repeat: number | null;
        };
        Insert: {
          deleted_at?: string | null;
          edited_at?: string;
          end_date?: string | null;
          has_cron_job?: boolean;
          id?: string;
          module_id: string;
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
          module_id?: string;
          next_run?: string | null;
          repetition_config?: Json | null;
          times_to_repeat?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'module_schedules_module_id_fkey';
            columns: ['module_id'];
            isOneToOne: false;
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
            isOneToOne: false;
            referencedRelation: 'module_actions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'module_sources_module_id_fkey';
            columns: ['module_id'];
            isOneToOne: false;
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'module_sources_type_id_fkey';
            columns: ['type_id'];
            isOneToOne: false;
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
            isOneToOne: false;
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
          label: string;
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
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users_saved_tracks: {
        Row: {
          added_at: string | null;
          id: string;
          track_id: string;
          user_id: string | null;
        };
        Insert: {
          added_at?: string | null;
          id?: string;
          track_id: string;
          user_id?: string | null;
        };
        Update: {
          added_at?: string | null;
          id?: string;
          track_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_saved_tracks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
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
            isOneToOne: true;
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
            isOneToOne: false;
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
  spotify: {
    Tables: {
      playlists: {
        Row: {
          id: string;
          last_fetched_at: string;
          snapshot_id: string;
          track_ids: string[];
        };
        Insert: {
          id: string;
          last_fetched_at: string;
          snapshot_id: string;
          track_ids?: string[];
        };
        Update: {
          id?: string;
          last_fetched_at?: string;
          snapshot_id?: string;
          track_ids?: string[];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] & Database['public']['Views'])
  ? (Database['public']['Tables'] & Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof Database['public']['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never;
