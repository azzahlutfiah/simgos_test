export interface Pasien {
  idPasien: number;
  noRm: string;
  nik: string;
  namaPasien: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  alamat: string;
  noHp: string;
  tanggalDaftar: string;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

export interface GenderStat {
  name: string;
  value: number;
  color: string;
}

export interface AgeGroupStat {
  group: string;
  count: number;
  code: string;
}

export interface StatsResponse {
  total: number;
  genderBreakdown: GenderStat[];
  ageGroups: AgeGroupStat[];
}
