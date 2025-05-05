/*
  # Add company structure

  1. New Tables
    - `aziende`: Table for companies
      - `id` (uuid, primary key)
      - `nome` (text)
      - `created_at` (timestamp)
    
    - `documenti_azienda`: Table for company documents
      - `id` (uuid, primary key)
      - `azienda_id` (uuid, foreign key)
      - `titolo` (text)
      - `data_scadenza` (date)
      - `file_path` (text)
      - `created_at` (timestamp)

  2. Changes
    - Add `azienda_id` to `dipendenti` table
    
  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS aziende (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create company documents table
CREATE TABLE IF NOT EXISTS documenti_azienda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  azienda_id uuid REFERENCES aziende(id) ON DELETE CASCADE,
  titolo text NOT NULL,
  data_scadenza date NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add company reference to employees
ALTER TABLE dipendenti
ADD COLUMN azienda_id uuid REFERENCES aziende(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE aziende ENABLE ROW LEVEL SECURITY;
ALTER TABLE documenti_azienda ENABLE ROW LEVEL SECURITY;

-- Policies for companies
CREATE POLICY "Gli utenti autenticati possono leggere le aziende"
  ON aziende FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gli utenti autenticati possono inserire aziende"
  ON aziende FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Gli utenti autenticati possono aggiornare aziende"
  ON aziende FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Gli utenti autenticati possono eliminare aziende"
  ON aziende FOR DELETE
  TO authenticated
  USING (true);

-- Policies for company documents
CREATE POLICY "Gli utenti autenticati possono leggere i documenti aziendali"
  ON documenti_azienda FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gli utenti autenticati possono inserire documenti aziendali"
  ON documenti_azienda FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Gli utenti autenticati possono aggiornare documenti aziendali"
  ON documenti_azienda FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Gli utenti autenticati possono eliminare documenti aziendali"
  ON documenti_azienda FOR DELETE
  TO authenticated
  USING (true);