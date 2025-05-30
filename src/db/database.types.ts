export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
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
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      authors: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      book_authors: {
        Row: {
          author_id: string;
          book_id: string;
          id: string;
        };
        Insert: {
          author_id: string;
          book_id: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          book_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "book_authors_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "authors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "book_authors_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "book_authors_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "user_read_books";
            referencedColumns: ["book_id"];
          },
          {
            foreignKeyName: "book_authors_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "user_rejected_books";
            referencedColumns: ["book_id"];
          },
          {
            foreignKeyName: "book_authors_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "user_to_read_books";
            referencedColumns: ["book_id"];
          },
        ];
      };
      books: {
        Row: {
          created_at: string;
          id: string;
          language: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          language: string;
          title: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          language?: string;
          title?: string;
        };
        Relationships: [];
      };
      recommendations: {
        Row: {
          ai_model: string;
          book_id: string;
          created_at: string;
          execution_time: unknown;
          id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_model: string;
          book_id: string;
          created_at?: string;
          execution_time: unknown;
          id?: string;
          status: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_model?: string;
          book_id?: string;
          created_at?: string;
          execution_time?: unknown;
          id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recommendations_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recommendations_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "user_read_books";
            referencedColumns: ["book_id"];
          },
          {
            foreignKeyName: "recommendations_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "user_rejected_books";
            referencedColumns: ["book_id"];
          },
          {
            foreignKeyName: "recommendations_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "user_to_read_books";
            referencedColumns: ["book_id"];
          },
        ];
      };
      user_books: {
        Row: {
          book_id: string;
          created_at: string;
          id: string;
          is_recommended: boolean;
          rating: boolean | null;
          recommendation_id: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          book_id: string;
          created_at?: string;
          id?: string;
          is_recommended?: boolean;
          rating?: boolean | null;
          recommendation_id?: string | null;
          status: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          book_id?: string;
          created_at?: string;
          id?: string;
          is_recommended?: boolean;
          rating?: boolean | null;
          recommendation_id?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_books_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_books_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "user_read_books";
            referencedColumns: ["book_id"];
          },
          {
            foreignKeyName: "user_books_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "user_rejected_books";
            referencedColumns: ["book_id"];
          },
          {
            foreignKeyName: "user_books_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "user_to_read_books";
            referencedColumns: ["book_id"];
          },
          {
            foreignKeyName: "user_books_recommendation_id_fkey";
            columns: ["recommendation_id"];
            isOneToOne: false;
            referencedRelation: "recommendations";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          created_at: string;
          id: string;
          preferred_language: string;
          reading_preferences: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          preferred_language: string;
          reading_preferences: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          preferred_language?: string;
          reading_preferences?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      user_read_books: {
        Row: {
          authors: string | null;
          book_id: string | null;
          created_at: string | null;
          id: string | null;
          is_recommended: boolean | null;
          language: string | null;
          rating: boolean | null;
          title: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      user_rejected_books: {
        Row: {
          authors: string | null;
          book_id: string | null;
          created_at: string | null;
          id: string | null;
          is_recommended: boolean | null;
          language: string | null;
          title: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      user_to_read_books: {
        Row: {
          authors: string | null;
          book_id: string | null;
          created_at: string | null;
          id: string | null;
          is_recommended: boolean | null;
          language: string | null;
          title: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { "": unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      set_limit: {
        Args: { "": number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { "": string };
        Returns: string[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const; 