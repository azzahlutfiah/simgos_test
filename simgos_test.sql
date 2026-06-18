-- ====================================================================
-- SIM GOS DATABASE SYSTEM - DRAFT UNTUK MySQL (simgos_test.sql)
-- ====================================================================
-- Deskripsi: Skema Tabel dan Data Awal Rekam Medis untuk Portal SIMGOS
-- Tanggal Pembuatan: 17 Juni 2026
-- Database Target: simgos_test
-- ====================================================================

-- 1. PEMBUATAN DATABASE
CREATE DATABASE IF NOT EXISTS simgos_test;
USE simgos_test;

-- 2. PEMBUATAN TABEL PASIEN
-- Menampung informasi terintegrasi data master rekam medis pasien.
CREATE TABLE IF NOT EXISTS pasien (
    id_pasien INT AUTO_INCREMENT COMMENT 'Keterangan: Primary Key Auto Increment',
    no_rm VARCHAR(20) NOT NULL COMMENT 'Keterangan: Nomor Rekam Medis Pasien',
    nik VARCHAR(16) NOT NULL COMMENT 'Keterangan: Nomor Induk Kependudukan',
    nama_pasien VARCHAR(100) NOT NULL COMMENT 'Keterangan: Nama Lengkap Pasien',
    jenis_kelamin ENUM('L', 'P') NOT NULL COMMENT 'Keterangan: L = Laki-laki, P = Perempuan',
    tanggal_lahir DATE NOT NULL COMMENT 'Keterangan: Tanggal Lahir Pasien',
    alamat TEXT COMMENT 'Keterangan: Alamat Tinggal Pasien',
    no_hp VARCHAR(20) COMMENT 'Keterangan: Nomor Telepon / HP Pasien',
    tanggal_daftar DATETIME NOT NULL COMMENT 'Keterangan: Waktu Pendaftaran Pasien',
    PRIMARY KEY (id_pasien),
    UNIQUE KEY uq_no_rm (no_rm),
    UNIQUE KEY uq_nik (nik)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. INSERT 100 DATA CONTOH PASIEN (POPULASI AWAL DATABASE)
-- Berisi nama-nama khas Indonesia dengan proporsi seimbang.
INSERT INTO pasien (no_rm, nik, nama_pasien, jenis_kelamin, tanggal_lahir, alamat, no_hp, tanggal_daftar) VALUES
('RM0001', '3275011203900001', 'Ahmad Fauzi', 'L', '1990-05-12', 'Jl. Merdeka No. 10, Jakarta Pusat', '081234567890', '2024-01-01 08:10:00'),
('RM0002', '3275022204980002', 'Budi Santoso', 'L', '1998-08-20', 'Jl. Jenderal Sudirman No. 45, Bandung', '081298765432', '2024-01-01 08:15:00'),
('RM0003', '3275030501950003', 'Siti Aminah', 'P', '1995-03-15', 'Jl. Diponegoro No. 12, Surabaya', '08212345678', '2024-01-01 08:20:00'),
('RM0004', '3275030612710004', 'Eko Prasetyo', 'L', '1971-12-04', 'Jl. Sudirman No. 13, Jakarta', '081442125232', '2024-01-02 15:00:00'),
('RM0005', '3275031608820005', 'Dewi Lestari', 'P', '1982-08-16', 'Jl. Gatot Subroto No. 16, Bandung', '081190412351', '2024-01-03 09:00:00'),
('RM0006', '3275030111730006', 'Hendra Kurniawan', 'L', '1973-11-01', 'Jl. Gajah Mada No. 19, Surabaya', '081267438495', '2024-01-04 03:00:00'),
('RM0007', '3275031405840007', 'Rina Wijaya', 'P', '1984-05-14', 'Jl. Hayam Wuruk No. 22, Semarang', '081903429384', '2024-01-04 21:00:00'),
('RM0008', '3275030209750008', 'Agung Wijaya', 'L', '1975-09-02', 'Jl. Diponegoro No. 25, Yogyakarta', '081273849501', '2024-01-05 15:00:00'),
('RM0009', '3275032607860009', 'Maya Saputri', 'P', '1986-07-26', 'Jl. Pemuda No. 28, Medan', '081394850123', '2024-01-06 09:00:00'),
('RM0010', '3275031102770010', 'Rian Hidayat', 'L', '1977-02-11', 'Jl. Merdeka No. 31, Makassar', '081504918273', '2024-01-07 03:00:00'),
('RM0011', '3275030910880011', 'Lina Marlina', 'P', '1988-10-09', 'Jl. Kartini No. 34, Palembang', '081701928374', '2024-01-07 21:00:00'),
('RM0012', '3275031804790012', 'Dimas Saputra', 'L', '1979-04-18', 'Jl. Dahlia No. 37, Denpasar', '081829384756', '2024-01-08 15:00:00'),
('RM0013', '3275031511900013', 'Sari Lestari', 'P', '1990-11-15', 'Jl. Melati No. 40, Malang', '081938475610', '2024-01-09 09:00:00'),
('RM0014', '3275032103810014', 'Doni Setiawan', 'L', '1981-03-21', 'Jl. Sudirman No. 43, Jakarta', '081129384756', '2024-01-10 03:00:00'),
('RM0015', '3275031005020015', 'Indah Permatasari', 'P', '2002-05-10', 'Jl. Gatot Subroto No. 46, Bandung', '081239485710', '2024-01-10 21:00:00'),
('RM0016', '3275032512730016', 'Aris Budiman', 'L', '1973-12-25', 'Jl. Gajah Mada No. 49, Surabaya', '081349581023', '2024-01-11 15:00:00'),
('RM0017', '3275031707840017', 'Fitri Handayani', 'P', '1984-07-17', 'Jl. Hayam Wuruk No. 52, Semarang', '081459601234', '2024-01-12 09:00:00'),
('RM0018', '3275030403750018', 'Taufik Rahman', 'L', '1975-03-04', 'Jl. Diponegoro No. 55, Yogyakarta', '081569712345', '2024-01-13 03:00:00'),
('RM0019', '3275032104860019', 'Putri Rahayu', 'P', '1986-04-21', 'Jl. Pemuda No. 58, Medan', '081679823456', '2024-01-13 21:00:00'),
('RM0020', '3275030105770020', 'Yanto Sunaryo', 'L', '1977-05-01', 'Jl. Merdeka No. 61, Makassar', '081789934567', '2024-01-14 15:00:00'),
('RM0021', '3275032711080021', 'Susi Susanti', 'P', '2008-11-27', 'Jl. Kartini No. 64, Palembang', '081890045678', '2024-01-15 09:00:00'),
('RM0022', '3275030912790022', 'Joko Purwanto', 'L', '1979-12-09', 'Jl. Dahlia No. 67, Denpasar', '081901156789', '2024-01-16 03:00:00'),
('RM0023', '3275032007800023', 'Megawati Sukarnoputri', 'P', '1980-07-20', 'Jl. Melati No. 70, Malang', '081112267890', '2024-01-16 21:00:00'),
('RM0024', '3275030701710024', 'Rudi Hermawan', 'L', '1971-01-07', 'Jl. Sudirman No. 73, Jakarta', '081223378901', '2024-01-17 15:00:00'),
('RM0025', '3275032412820025', 'Puan Maharani', 'P', '1982-12-24', 'Jl. Gatot Subroto No. 76, Bandung', '081334489012', '2024-01-18 09:00:00'),
('RM0026', '3275030303730026', 'Dedi Siregar', 'L', '1973-03-03', 'Jl. Gajah Mada No. 79, Surabaya', '081445590123', '2024-01-19 03:00:00'),
('RM0027', '3275032907040027', 'Sri Mulyani', 'P', '2004-07-29', 'Jl. Hayam Wuruk No. 82, Semarang', '081556601234', '2024-01-19 21:00:00'),
('RM0028', '3275031103750028', 'Andi Pratama', 'L', '1975-03-11', 'Jl. Diponegoro No. 85, Yogyakarta', '081667712345', '2024-01-20 15:00:00'),
('RM0029', '3275032808860029', 'Retno Marsudi', 'P', '1986-08-28', 'Jl. Pemuda No. 88, Medan', '081778823456', '2024-01-21 09:00:00'),
('RM0030', '3275031911770030', 'Fajar Nugroho', 'L', '1977-11-19', 'Jl. Merdeka No. 91, Makassar', '081889934567', '2024-01-22 03:00:00'),
('RM0031', '3275031005880031', 'Nila Moeloek', 'P', '1988-05-10', 'Jl. Kartini No. 94, Palembang', '081990045678', '2024-01-22 21:00:00'),
('RM0032', '3275032212790032', 'Denny Cahyadi', 'L', '1979-12-22', 'Jl. Dahlia No. 97, Denpasar', '081101156789', '2024-01-23 15:00:00'),
('RM0033', '3275031407030033', 'Tri Rismaharini', 'P', '2003-07-14', 'Jl. Melati No. 100, Malang', '081212267890', '2024-01-24 09:00:00'),
('RM0034', '3275030206710034', 'Aditya Perkasa', 'L', '1971-06-02', 'Jl. Sudirman No. 103, Jakarta', '081323378901', '2024-01-25 03:00:00'),
('RM0035', '3275032304820035', 'Khofifah Indar', 'P', '1982-04-23', 'Jl. Gatot Subroto No. 106, Bandung', '081434489012', '2024-01-25 21:00:00'),
('RM0036', '3275030602730036', 'Guntur Wibowo', 'L', '1973-02-06', 'Jl. Gajah Mada No. 109, Surabaya', '081545590123', '2024-01-26 15:00:00'),
('RM0037', '3275031709140037', 'Susi Pudjiastuti', 'P', '2014-09-17', 'Jl. Hayam Wuruk No. 112, Semarang', '081656601234', '2024-01-27 09:00:00'),
('RM0038', '3275031201750038', 'Bambang Pamungkas', 'L', '1975-01-12', 'Jl. Diponegoro No. 115, Yogyakarta', '081767712345', '2024-01-28 03:00:00'),
('RM0039', '3275031808860039', 'Yanti Rahmawati', 'P', '1986-08-18', 'Jl. Pemuda No. 118, Medan', '081878823456', '2024-01-28 21:00:00'),
('RM0040', '3275032801770040', 'Wahyu Hidayat', 'L', '1977-01-28', 'Jl. Merdeka No. 121, Makassar', '081989934567', '2024-01-29 15:00:00'),
('RM0041', '3275030911080041', 'Ani Yudhoyono', 'P', '2008-11-09', 'Jl. Kartini No. 124, Palembang', '081100045678', '2024-01-30 09:00:00'),
('RM0042', '3275032112790042', 'Ridwan Kamil', 'L', '1979-12-21', 'Jl. Dahlia No. 127, Denpasar', '081211156789', '2024-01-31 03:00:00'),
('RM0043', '3275031307800043', 'Iriana Jokowi', 'P', '1980-07-13', 'Jl. Melati No. 130, Malang', '081322267890', '2024-01-31 21:00:00'),
('RM0044', '3275030101710044', 'Slamet Rahardjo', 'L', '1971-01-01', 'Jl. Sudirman No. 133, Jakarta', '081433378901', '2024-02-01 15:00:00'),
('RM0045', '3275532012020045', 'Wulan Guritno', 'P', '2002-12-20', 'Jl. Gatot Subroto No. 136, Bandung', '081544489012', '2024-02-02 09:00:00'),
('RM0046', '3275032204730046', 'Tri Wahyudi', 'L', '1973-04-22', 'Jl. Gajah Mada No. 139, Surabaya', '081655590123', '2024-02-03 03:00:00'),
('RM0047', '3275532707840047', 'Dian Sastrowardoyo', 'P', '1984-07-27', 'Jl. Hayam Wuruk No. 142, Semarang', '081766601234', '2024-02-03 21:00:00'),
('RM0048', '3275031301750048', 'Gilang Ramadhan', 'L', '1975-01-13', 'Jl. Diponegoro No. 145, Yogyakarta', '081877712345', '2024-02-04 15:00:00'),
('RM0049', '3275531808860049', 'Chelsea Islan', 'P', '1986-08-18', 'Jl. Pemuda No. 148, Medan', '081988823456', '2024-02-05 09:00:00'),
('RM0050', '3275032801770050', 'Indra Lesmana', 'L', '1977-01-28', 'Jl. Merdeka No. 1, Makassar', '081199934567', '2024-02-06 03:00:00'),
('RM0051', '3275530911080051', 'Pevita Pearce', 'P', '2008-11-09', 'Jl. Kartini No. 4, Palembang', '081200045678', '2024-02-06 21:00:00'),
('RM0052', '3275032112790052', 'Zulham Zamrun', 'L', '1979-12-21', 'Jl. Dahlia No. 7, Denpasar', '081311156789', '2024-02-07 15:00:00'),
('RM0053', '3275531307800053', 'Nia Ramadhani', 'P', '1980-07-13', 'Jl. Melati No. 10, Malang', '081422267890', '2024-02-08 09:00:00'),
('RM0054', '3275030101710054', 'Kurniawan Dwi', 'L', '1971-01-01', 'Jl. Sudirman No. 13, Jakarta', '081533378901', '2024-02-09 03:00:00'),
('RM0055', '3275531112020055', 'Laudya Cynthia', 'P', '2002-12-11', 'Jl. Gatot Subroto No. 16, Bandung', '081644489012', '2024-02-09 21:00:00'),
('RM0056', '3275032204730056', 'Eka Ramdani', 'L', '1973-04-22', 'Jl. Gajah Mada No. 19, Surabaya', '081755590123', '2024-02-10 15:00:00'),
('RM0057', '3275532707840057', 'Zaskia Adya', 'P', '1984-07-27', 'Jl. Hayam Wuruk No. 22, Semarang', '081866601234', '2024-02-11 09:00:00'),
('RM0058', '3275031301750058', 'Dwi Cahyo', 'L', '1975-01-13', 'Jl. Diponegoro No. 25, Yogyakarta', '081977712345', '2024-02-12 03:00:00'),
('RM0059', '3275531808860059', 'Shireen Sungkar', 'P', '1986-08-18', 'Jl. Pemuda No. 28, Medan', '081188823456', '2024-02-12 21:00:00'),
('RM0060', '3275032801770060', 'Tri Harmoko', 'L', '1977-01-28', 'Jl. Merdeka No. 31, Makassar', '081299934567', '2024-02-13 15:00:00'),
('RM0061', '3275530911080061', 'Acha Septriasa', 'P', '2008-11-09', 'Jl. Kartini No. 34, Palembang', '081300045678', '2024-02-14 09:00:00'),
('RM0062', '3275032112790062', 'Suryo Agung', 'L', '1979-12-21', 'Jl. Dahlia No. 37, Denpasar', '081411156789', '2024-02-15 03:00:00'),
('RM0063', '3275531307800063', 'Agnez Mo', 'P', '1980-07-13', 'Jl. Melati No. 40, Malang', '081522267890', '2024-02-15 21:00:00'),
('RM0064', '3275030101710064', 'Bintang Cahyono', 'L', '1971-01-01', 'Jl. Sudirman No. 43, Jakarta', '081633378901', '2024-02-16 15:00:00'),
('RM0065', '3275530212020065', 'Bunga Citra', 'P', '2002-12-02', 'Jl. Gatot Subroto No. 46, Bandung', '081744489012', '2024-02-17 09:00:00'),
('RM0066', '3275032204730066', 'Panji Trihatmodjo', 'L', '1973-04-22', 'Jl. Gajah Mada No. 49, Surabaya', '081855590123', '2024-02-18 03:00:00'),
('RM0067', '3275532707840067', 'Isyana Sarasvati', 'P', '1984-07-27', 'Jl. Hayam Wuruk No. 52, Semarang', '081966601234', '2024-02-18 21:00:00'),
('RM0068', '3275031301750068', 'Giri Prasta', 'L', '1975-01-13', 'Jl. Diponegoro No. 55, Yogyakarta', '081177712345', '2024-02-19 15:00:00'),
('RM0069', '3275531808860069', 'Raisa Andriana', 'P', '1986-08-18', 'Jl. Pemuda No. 58, Medan', '081288823456', '2024-02-20 09:00:00'),
('RM0070', '3275032801770070', 'Arya Wiguna', 'L', '1977-01-28', 'Jl. Merdeka No. 61, Makassar', '081399934567', '2024-02-21 03:00:00'),
('RM0071', '3275530911080071', 'Maudy Ayunda', 'P', '2008-11-09', 'Jl. Kartini No. 64, Palembang', '081400045678', '2024-02-21 21:00:00'),
('RM0072', '3275032112790072', 'Rizky Billar', 'L', '1979-12-21', 'Jl. Dahlia No. 67, Denpasar', '081511156789', '2024-02-22 15:00:00'),
('RM0073', '3275531307800073', 'Najwa Shihab', 'P', '1980-07-13', 'Jl. Melati No. 70, Malang', '081622267890', '2024-02-23 09:00:00'),
('RM0074', '3275030101710074', 'Raffi Ahmad', 'L', '1971-01-01', 'Jl. Sudirman No. 73, Jakarta', '081733378901', '2024-02-24 03:00:00'),
('RM0075', '3275531112110075', 'Susi Latifah', 'P', '2011-12-11', 'Jl. Gatot Subroto No. 76, Bandung', '081844489012', '2024-02-24 21:00:00'),
('RM0076', '3275032204730076', 'Atta Halilintar', 'L', '1973-04-22', 'Jl. Gajah Mada No. 79, Surabaya', '081955590123', '2024-02-25 15:00:00'),
('RM0077', '3275532707840077', 'Kiki Amalia', 'P', '1984-07-27', 'Jl. Hayam Wuruk No. 82, Semarang', '081166601234', '2024-02-26 09:00:00'),
('RM0078', '3275031301750078', 'Gibran Rakabuming', 'L', '1975-01-13', 'Jl. Diponegoro No. 85, Yogyakarta', '081277712345', '2024-02-27 03:00:00'),
('RM0079', '3275531808860079', 'Yuni Shara', 'P', '1986-08-18', 'Jl. Pemuda No. 88, Medan', '081388823456', '2024-02-27 21:00:00'),
('RM0080', '3275032801770080', 'Prabowo Subianto', 'L', '1977-01-28', 'Jl. Merdeka No. 91, Makassar', '081499934567', '2024-02-28 15:00:00'),
('RM0081', '3275530911080081', 'Krisdayanti', 'P', '2008-11-09', 'Jl. Kartini No. 94, Palembang', '081500045678', '2024-02-29 09:00:00'),
('RM0082', '3275032112790082', 'Anies Baswedan', 'L', '1979-12-21', 'Jl. Dahlia No. 97, Denpasar', '081611156789', '2024-03-01 03:00:00'),
('RM0083', '3275531307800083', 'Ashanty Siddik', 'P', '1980-07-13', 'Jl. Melati No. 100, Malang', '081722267890', '2024-03-01 21:00:00'),
('RM0084', '3275030101710084', 'Ganjar Pranowo', 'L', '1971-01-01', 'Jl. Sudirman No. 103, Jakarta', '081833378901', '2024-03-02 15:00:00'),
('RM0085', '3275532012020085', 'Aurel Hermansyah', 'P', '2002-12-20', 'Jl. Gatot Subroto No. 106, Bandung', '081944489012', '2024-03-03 09:00:00'),
('RM0086', '3275032204730086', 'Mahfud MD', 'L', '1973-04-22', 'Jl. Gajah Mada No. 109, Surabaya', '081155590123', '2024-03-04 03:00:00'),
('RM0087', '3275532707840087', 'Lesti Kejora', 'P', '1984-07-27', 'Jl. Hayam Wuruk No. 112, Semarang', '081266601234', '2024-03-04 21:00:00'),
('RM0088', '3275031301750088', 'Erick Thohir', 'L', '1975-01-13', 'Jl. Diponegoro No. 115, Yogyakarta', '081377712345', '2024-03-05 15:00:00'),
('RM0089', '3275531808860089', 'Cinta Laura', 'P', '1986-08-18', 'Jl. Pemuda No. 118, Medan', '081488823456', '2024-03-06 09:00:00'),
('RM0090', '3275032801770090', 'Sandiaga Uno', 'L', '1977-01-28', 'Jl. Merdeka No. 121, Makassar', '081599934567', '2024-03-07 03:00:00'),
('RM0091', '3275530911080091', 'Prilly Latuconsina', 'P', '2008-11-09', 'Jl. Kartini No. 124, Palembang', '081600045678', '2024-03-07 21:00:00'),
('RM0092', '3275032112790092', 'Deddy Corbuzier', 'L', '1979-12-21', 'Jl. Dahlia No. 127, Denpasar', '081711156789', '2024-03-08 15:00:00'),
('RM0093', '3275531307800093', 'Gisella Anastasia', 'P', '1980-07-13', 'Jl. Melati No. 130, Malang', '081822267890', '2024-03-09 09:00:00'),
('RM0094', '3275030101710094', 'Reza Rahadian', 'L', '1971-01-01', 'Jl. Sudirman No. 133, Jakarta', '081933378901', '2024-03-10 03:00:00'),
('RM0095', '3275532012020095', 'Jessica Iskandar', 'P', '2002-12-20', 'Jl. Gatot Subroto No. 136, Bandung', '081144489012', '2024-03-10 21:00:00'),
('RM0096', '3275032204730096', 'Vino G. Bastian', 'L', '1973-04-22', 'Jl. Gajah Mada No. 139, Surabaya', '081255590123', '2024-03-11 15:00:00'),
('RM0097', '3275532707840097', 'Nia Daniaty', 'P', '1984-07-27', 'Jl. Hayam Wuruk No. 142, Semarang', '081366601234', '2024-03-12 09:00:00'),
('RM0098', '3275031301750098', 'Iko Uwais', 'L', '1975-01-13', 'Jl. Diponegoro No. 145, Yogyakarta', '081477712345', '2024-03-13 03:00:00'),
('RM0099', '3275531808860099', 'Iis Dahlia', 'P', '1986-08-18', 'Jl. Pemuda No. 148, Medan', '081588823456', '2024-03-13 21:00:00'),
('RM0100', '3275530911080100', 'Inul Daratista', 'P', '2008-11-09', 'Jl. Kartini No. 150, Palembang', '081699945678', '2024-03-14 15:00:00');


-- ====================================================================
-- 4. KUMPULAN QUERY TUGAS AKADEMIS & OPERASIONAL UTAMA
-- ====================================================================

-- TUGAS 1: Tampilkan seluruh data pasien secara lengkap
-- Query:
SELECT * FROM pasien;

-- TUGAS 2: Tampilkan nama_pasien, jenis_kelamin, dan tanggal_lahir untuk semua pasien
-- Query:
SELECT nama_pasien, jenis_kelamin, tanggal_lahir FROM pasien;

-- TUGAS 3: Tampilkan 10 pasien terakhir yang didaftarkan
-- Query:
SELECT * FROM pasien ORDER BY tanggal_daftar DESC LIMIT 10;

-- TUGAS 4: Filter pasien laki-laki yang lahir setelah 01 Januari 2000
-- Query:
SELECT * FROM pasien 
WHERE jenis_kelamin = 'L' 
  AND tanggal_lahir > '2000-01-01';

-- TUGAS 5: Agregasi hitung jumlah pasien laki-laki dan jumlah pasien perempuan
-- Query:
SELECT jenis_kelamin, COUNT(*) AS jumlah_pasien 
FROM pasien 
GROUP BY jenis_kelamin;

-- TUGAS 6: Update nomor handphone pasien dengan no_rm='RM0001' menjadi '081111111111'
-- Query:
UPDATE pasien 
SET no_hp = '081111111111' 
WHERE no_rm = 'RM0001';
