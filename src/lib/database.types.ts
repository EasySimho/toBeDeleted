export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      aziende: {
        Row: {
          id: string
          nome: string
          indirizzo: string
          citta: string
          cap: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          indirizzo: string
          citta: string
          cap: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          indirizzo?: string
          citta?: string
          cap?: string
          created_at?: string
        }
      }
      dipendenti: {
        Row: {
          id: string
          nome: string
          cognome: string
          azienda_id: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          cognome: string
          azienda_id: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          cognome?: string
          azienda_id?: string
          created_at?: string
        }
      }
      documenti: {
        Row: {
          id: string
          dipendente_id: string
          titolo: string
          data_scadenza: string
          file_path: string
          created_at: string
        }
        Insert: {
          id?: string
          dipendente_id: string
          titolo: string
          data_scadenza: string
          file_path: string
          created_at?: string
        }
        Update: {
          id?: string
          dipendente_id?: string
          titolo?: string
          data_scadenza?: string
          file_path?: string
          created_at?: string
        }
      }
      documenti_azienda: {
        Row: {
          id: string
          azienda_id: string
          titolo: string
          data_scadenza: string
          file_path: string
          created_at: string
        }
        Insert: {
          id?: string
          azienda_id: string
          titolo: string
          data_scadenza: string
          file_path: string
          created_at?: string
        }
        Update: {
          id?: string
          azienda_id?: string
          titolo?: string
          data_scadenza?: string
          file_path?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}