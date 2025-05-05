/*
  # Creazione schema del database

  1. Nuove Tabelle
    - `dipendenti`: Tabella principale per i dipendenti
      - `id` (uuid, chiave primaria)
      - `nome` (testo)
      - `cognome` (testo) 
      - `created_at` (timestamp)
    
    - `documenti`: Tabella per i documenti dei dipendenti
      - `id` (uuid, chiave primaria)
      - `dipendente_id` (uuid, chiave esterna)
      - `titolo` (testo)
      - `data_scadenza` (timestamp)
      - `file_path` (testo)
      - `created_at` (timestamp)
  
  2. Sicurezza
    - Attivazione Row Level Security su entrambe le tabelle
    - Aggiunta policy per consentire operazioni CRUD agli utenti autenticati
*/

-- Tabella dipendenti
CREATE TABLE IF NOT EXISTS dipendenti (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cognome text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabella documenti
CREATE TABLE IF NOT EXISTS documenti (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dipendente_id uuid REFERENCES dipendenti(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  data_scadenza date NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Attiva RLS
ALTER TABLE dipendenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE documenti ENABLE ROW LEVEL SECURITY;

-- Policy per dipendenti
CREATE POLICY "Gli utenti autenticati possono leggere i dipendenti"
  ON dipendenti FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gli utenti autenticati possono inserire dipendenti"
  ON dipendenti FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Gli utenti autenticati possono aggiornare dipendenti"
  ON dipendenti FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Gli utenti autenticati possono eliminare dipendenti"
  ON dipendenti FOR DELETE
  TO authenticated
  USING (true);

-- Policy per documenti
CREATE POLICY "Gli utenti autenticati possono leggere i documenti"
  ON documenti FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gli utenti autenticati possono inserire documenti"
  ON documenti FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Gli utenti autenticati possono aggiornare documenti"
  ON documenti FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Gli utenti autenticati possono eliminare documenti"
  ON documenti FOR DELETE
  TO authenticated
  USING (true);

-- Crea bucket per i documenti
INSERT INTO storage.buckets (id, name) VALUES ('documents', 'documents')
ON CONFLICT (id) DO NOTHING;

-- Policy per storage
CREATE POLICY "Gli utenti autenticati possono leggere i file"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Gli utenti autenticati possono caricare file"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Gli utenti autenticati possono aggiornare i propri file"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Gli utenti autenticati possono eliminare i propri file"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');