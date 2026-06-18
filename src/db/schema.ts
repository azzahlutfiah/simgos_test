import { pgTable, serial, text, timestamp, varchar, pgEnum, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the 'users' table for Firebase Auth synchronization
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define pgEnum for 'jenis_kelamin' L (Laki-laki) and P (Perempuan)
export const jenisKelaminEnum = pgEnum('jenis_kelamin', ['L', 'P']);

// Define the 'pasien' table
export const pasien = pgTable('pasien', {
  idPasien: serial('id_pasien').primaryKey(), // auto_increment int PK
  noRm: varchar('no_rm', { length: 20 }).notNull(), // nomor rekam medis
  nik: varchar('nik', { length: 16 }).notNull(), // nomor induk kependudukan
  namaPasien: varchar('nama_pasien', { length: 100 }).notNull(), // nama pasien
  jenisKelamin: jenisKelaminEnum('jenis_kelamin').notNull(), // L/P
  tanggalLahir: date('tanggal_lahir').notNull(), // tanggal lahir
  alamat: text('alamat').notNull(), // alamat pasien
  noHp: varchar('no_hp', { length: 20 }).notNull(), // nomor handphone
  tanggalDaftar: timestamp('tanggal_daftar').defaultNow().notNull(), // tanggal pendaftaran
});
