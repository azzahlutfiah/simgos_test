import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { pasien } from './src/db/schema.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { eq, like, or, and, sql, desc } from 'drizzle-orm';

const indonesianNamesL = [
  "Ahmad Fauzi", "Budi Santoso", "Eko Prasetyo", "Hendra Kurniawan", "Agung Wijaya",
  "Rian Hidayat", "Dimas Saputra", "Doni Setiawan", "Aris Budiman", "Taufik Rahman",
  "Yanto Sunaryo", "Joko Purwanto", "Rudi Hermawan", "Dedi Siregar", "Andi Pratama",
  "Fajar Nugroho", "Denny Cahyadi", "Aditya Perkasa", "Guntur Wibowo", "Bambang Pamungkas",
  "Wahyu Hidayat", "Ridwan Kamil", "Slamet Rahardjo", "Tri Wahyudi", "Gilang Ramadhan",
  "Indra Lesmana", "Zulham Zamrun", "Kurniawan Dwi", "Eka Ramdani", "Dwi Cahyo",
  "Tri Harmoko", "Suryo Agung", "Bintang Cahyono", "Panji Trihatmodjo", "Giri Prasta",
  "Arya Wiguna", "Rizky Billar", "Raffi Ahmad", "Atta Halilintar", "Gibran Rakabuming",
  "Prabowo Subianto", "Anies Baswedan", "Ganjar Pranowo", "Mahfud MD", "Erick Thohir",
  "Sandiaga Uno", "Deddy Corbuzier", "Reza Rahadian", "Vino G. Bastian", "Iko Uwais"
];

const indonesianNamesP = [
  "Siti Aminah", "Dewi Lestari", "Rina Wijaya", "Maya Saputri", "Lina Marlina",
  "Sari Lestari", "Indah Permatasari", "Fitri Handayani", "Putri Rahayu", "Susi Susanti",
  "Megawati Sukarnoputri", "Puan Maharani", "Sri Mulyani", "Retno Marsudi", "Nila Moeloek",
  "Tri Rismaharini", "Khofifah Indar", "Susi Pudjiastuti", "Yanti Rahmawati", "Ani Yudhoyono",
  "Iriana Jokowi", "Wulan Guritno", "Dian Sastrowardoyo", "Chelsea Islan", "Pevita Pearce",
  "Nia Ramadhani", "Laudya Cynthia", "Zaskia Adya", "Shireen Sungkar", "Acha Septriasa",
  "Agnez Mo", "Bunga Citra", "Isyana Sarasvati", "Raisa Andriana", "Maudy Ayunda",
  "Najwa Shihab", "Susi Latifah", "Kiki Amalia", "Yuni Shara", "Krisdayanti",
  "Ashanty Siddik", "Aurel Hermansyah", "Lesti Kejora", "Cinta Laura", "Prilly Latuconsina",
  "Gisella Anastasia", "Jessica Iskandar", "Nia Daniaty", "Iis Dahlia", "Inul Daratista"
];

const cities = ["Jakarta", "Bandung", "Surabaya", "Semarang", "Yogyakarta", "Medan", "Makassar", "Palembang", "Denpasar", "Malang"];
const streets = ["Jl. Sudirman", "Jl. Gatot Subroto", "Jl. Gajah Mada", "Jl. Hayam Wuruk", "Jl. Diponegoro", "Jl. Pemuda", "Jl. Merdeka", "Jl. Kartini", "Jl. Dahlia", "Jl. Melati"];

async function seedPatientsIfEmpty() {
  try {
    const countResult = await db.select({ count: sql<number>`count(*)::int` }).from(pasien);
    const count = countResult[0]?.count || 0;
    if (count > 0) {
      console.log(`Database already has ${count} patients. Skipping seed.`);
      return;
    }

    console.log("Seeding database with 100 patient records...");
    const valuesToInsert = [];

    // 1. RM0001 (Ahmad Fauzi)
    valuesToInsert.push({
      noRm: "RM0001",
      nik: "3275011203900001",
      namaPasien: "Ahmad Fauzi",
      jenisKelamin: "L" as const,
      tanggalLahir: "1990-05-12",
      alamat: "Jl. Merdeka No. 10, Jakarta Pusat",
      noHp: "081234567890",
      tanggalDaftar: new Date("2024-01-01T08:10:00")
    });

    // 2. RM0002 (Budi Santoso)
    valuesToInsert.push({
      noRm: "RM0002",
      nik: "3275022204980002",
      namaPasien: "Budi Santoso",
      jenisKelamin: "L" as const,
      tanggalLahir: "1998-08-20",
      alamat: "Jl. Jenderal Sudirman No. 45, Bandung",
      noHp: "081298765432",
      tanggalDaftar: new Date("2024-01-01T08:15:00")
    });

    // 3. RM0003 (Siti Aminah)
    valuesToInsert.push({
      noRm: "RM0003",
      nik: "3275030501950003",
      namaPasien: "Siti Aminah",
      jenisKelamin: "P" as const,
      tanggalLahir: "1995-03-15",
      alamat: "Jl. Diponegoro No. 12, Surabaya",
      noHp: "08212345678",
      tanggalDaftar: new Date("2024-01-01T08:20:00")
    });

    // Generate others up to 100
    for (let i = 4; i <= 100; i++) {
      const rmStr = "RM" + i.toString().padStart(4, "0");
      const isMale = i % 2 === 0;
      const gender = isMale ? ("L" as const) : ("P" as const);
      
      const nameArray = isMale ? indonesianNamesL : indonesianNamesP;
      const baseName = nameArray[(i - 4) % nameArray.length];
      const cycleCount = Math.floor((i - 4) / nameArray.length);
      const namaPasien = cycleCount > 0 ? `${baseName} ${String.fromCharCode(65 + cycleCount)}` : baseName;

      const nik = "3275" + Math.floor(100000000000 + Math.random() * 900000000000).toString();

      // Alternate birth years. Ensure a good amount of males or females born after 2000.
      let birthYear = 1970 + (i % 30);
      if (i % 3 === 0) {
        birthYear = 2000 + (i % 15) + 1; // 2001 to 2015
      }
      const birthMonth = (1 + (i % 12)).toString().padStart(2, "0");
      const birthDay = (1 + (i % 28)).toString().padStart(2, "0");
      const tanggalLahir = `${birthYear}-${birthMonth}-${birthDay}`;

      const street = streets[i % streets.length];
      const city = cities[i % cities.length];
      const streetNum = 1 + (i * 3) % 150;
      const alamat = `${street} No. ${streetNum}, ${city}`;

      const noHp = "08" + Math.floor(1000000000 + Math.random() * 9000000000).toString();

      const regDate = new Date("2024-01-02T09:00:00");
      regDate.setHours(regDate.getHours() + i * 18);

      valuesToInsert.push({
        noRm: rmStr,
        nik,
        namaPasien,
        jenisKelamin: gender,
        tanggalLahir,
        alamat,
        noHp,
        tanggalDaftar: regDate
      });
    }

    const batchSize = 25;
    for (let i = 0; i < valuesToInsert.length; i += batchSize) {
      const batch = valuesToInsert.slice(i, i + batchSize);
      await db.insert(pasien).values(batch);
    }
    console.log("Database seeded successfully with 100 patients!");
  } catch (error) {
    console.error("Failed to seed database patients:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Run the 100-patients auto-seeding system
  await seedPatientsIfEmpty();

  // Middleware for parsing JSON requests
  app.use(express.json());

  // API 1: Sync User from Firebase Login
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { email, uid } = req.user!;
      const user = await getOrCreateUser(uid, email || '');
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Error in auth sync:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API 2: Get Patients list with filter, search, sorting and pagination
  app.get('/api/pasien', requireAuth, async (req: AuthRequest, res) => {
    try {
      const search = req.query.search as string || '';
      const gender = req.query.gender as string || '';
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      let conditions = [];

      // Search filters: Name, NIK, No RM
      if (search) {
        conditions.push(
          or(
            like(pasien.namaPasien, `%${search}%`),
            like(pasien.nik, `%${search}%`),
            like(pasien.noRm, `%${search}%`),
            like(pasien.alamat, `%${search}%`)
          )
        );
      }

      // Gender filter
      if (gender === 'L' || gender === 'P') {
        conditions.push(eq(pasien.jenisKelamin, gender));
      }

      const queryCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Fetch patient count
      const totalCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(pasien)
        .where(queryCondition);
      const total = totalCountResult[0]?.count || 0;

      // Fetch patients
      const patientList = await db
        .select()
        .from(pasien)
        .where(queryCondition)
        .orderBy(desc(pasien.tanggalDaftar))
        .limit(limit)
        .offset(offset);

      res.json({
        data: patientList,
        pagination: {
          total,
          limit,
          offset,
        },
      });
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ error: 'Failed to fetch patient records' });
    }
  });

  // API 3: Create Patient
  app.post('/api/pasien', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { noRm, nik, namaPasien, jenisKelamin, tanggalLahir, alamat, noHp } = req.body;

      if (!noRm || !nik || !namaPasien || !jenisKelamin || !tanggalLahir || !alamat || !noHp) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (jenisKelamin !== 'L' && jenisKelamin !== 'P') {
        return res.status(400).json({ error: "Gender must be either 'L' or 'P'" });
      }

      const inserted = await db
        .insert(pasien)
        .values({
          noRm,
          nik,
          namaPasien,
          jenisKelamin,
          tanggalLahir,
          alamat,
          noHp,
          tanggalDaftar: new Date(),
        })
        .returning();

      res.status(201).json(inserted[0]);
    } catch (error: any) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Failed to save patient record' });
    }
  });

  // API 4: Update Patient
  app.put('/api/pasien/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { noRm, nik, namaPasien, jenisKelamin, tanggalLahir, alamat, noHp } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }

      if (jenisKelamin && jenisKelamin !== 'L' && jenisKelamin !== 'P') {
        return res.status(400).json({ error: "Gender must be either 'L' or 'P'" });
      }

      const updated = await db
        .update(pasien)
        .set({
          noRm,
          nik,
          namaPasien,
          jenisKelamin,
          tanggalLahir,
          alamat,
          noHp,
        })
        .where(eq(pasien.idPasien, id))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json(updated[0]);
    } catch (error: any) {
      console.error('Error updating patient:', error);
      res.status(500).json({ error: 'Failed to update patient record' });
    }
  });

  // API 5: Delete Patient
  app.delete('/api/pasien/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }

      const deleted = await db
        .delete(pasien)
        .where(eq(pasien.idPasien, id))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json({ success: true, deleted: deleted[0] });
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ error: 'Failed to delete patient record' });
    }
  });

  // API 6: Stats and Aggregations (computed in-memory for rock-solid stability)
  app.get('/api/pasien/stats', requireAuth, async (req: AuthRequest, res) => {
    try {
      // Fetch some aggregate data safely
      const allPatients = await db.select({
        jenisKelamin: pasien.jenisKelamin,
        tanggalLahir: pasien.tanggalLahir,
        idPasien: pasien.idPasien,
      }).from(pasien);

      const totalCount = allPatients.length;
      let maleCount = 0;
      let femaleCount = 0;

      // Age group categories
      let anakAnak = 0; // 0 - 12
      let remaja = 0;   // 13 - 19
      let dewasa = 0;   // 20 - 59
      let lansia = 0;   // 60+

      const currentYear = new Date().getFullYear();

      allPatients.forEach(p => {
        // Gender breakdown
        if (p.jenisKelamin === 'L') maleCount++;
        if (p.jenisKelamin === 'P') femaleCount++;

        // Age group breakdown
        if (p.tanggalLahir) {
          const birthYear = new Date(p.tanggalLahir).getFullYear();
          const age = currentYear - birthYear;
          if (age <= 12) anakAnak++;
          else if (age <= 19) remaja++;
          else if (age <= 59) dewasa++;
          else lansia++;
        }
      });

      res.json({
        total: totalCount,
        genderBreakdown: [
          { name: 'Laki-laki', value: maleCount, color: '#3b82f6' },
          { name: 'Perempuan', value: femaleCount, color: '#ec4899' },
        ],
        ageGroups: [
          { group: 'Anak-anak (0-12)', count: anakAnak, code: 'Anak' },
          { group: 'Remaja (13-19)', count: remaja, code: 'Remaja' },
          { group: 'Dewasa (20-59)', count: dewasa, code: 'Dewasa' },
          { group: 'Lansia (60+)', count: lansia, code: 'Lansia' },
        ],
      });
    } catch (error: any) {
      console.error('Error generating statistics:', error);
      res.status(500).json({ error: 'Failed to compile database statistics' });
    }
  });

  // API 7: Execute raw SQL query simulating MySQL console
  app.post('/api/mysql/query', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query string is required' });
      }

      // Format query for PostgreSQL compatibility
      // Standardize quotes, field naming (camelCase to snake_case), etc.
      let preparedQuery = query
        .replace(/`/g, '') // remove MySQL backticks
        .replace(/\bNama_Pasien\b/g, 'nama_pasien')
        .replace(/\bJenis_Kelamin\b/g, 'jenis_kelamin')
        .replace(/\bTanggal_Lahir\b/g, 'tanggal_lahir')
        .replace(/\bdari\b/gi, 'from')
        .replace(/\bnamaPasien\b/gi, 'nama_pasien')
        .replace(/\bnoRm\b/gi, 'no_rm')
        .replace(/\bjenisKelamin\b/gi, 'jenis_kelamin')
        .replace(/\btanggalLahir\b/gi, 'tanggal_lahir')
        .replace(/\bnoHp\b/gi, 'no_hp')
        .replace(/\btanggalDaftar\b/gi, 'tanggal_daftar')
        .replace(/\bidPasien\b/gi, 'id_pasien')
        // Seamless interchangeable support for 5-digit RM00001 with 4-digit RM0001
        .replace(/'RM00001'/g, "'RM0001'")
        .trim();

      // Check permitted syntax for security: only allowing SELECT, UPDATE, INSERT, DELETE, EXPLAIN, SHOW
      const uppercaseQuery = preparedQuery.toUpperCase();
      if (
        !uppercaseQuery.startsWith('SELECT') &&
        !uppercaseQuery.startsWith('UPDATE') &&
        !uppercaseQuery.startsWith('INSERT') &&
        !uppercaseQuery.startsWith('DELETE') &&
        !uppercaseQuery.startsWith('SHOW') &&
        !uppercaseQuery.startsWith('EXPLAIN')
      ) {
        return res.status(400).json({ error: 'Hanya operasi SELECT, UPDATE, INSERT, atau DELETE yang diperbolehkan untuk menjaga keamanan database.' });
      }

      // Execute SQL on the active PostgreSQL pool
      const queryResult = await db.execute(sql.raw(preparedQuery));
      
      const rows = queryResult.rows || [];
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      const rowCount = queryResult.rowCount ?? null;

      res.json({
        success: true,
        columns,
        rows,
        rowCount,
      });
    } catch (error: any) {
      console.error('MySQL Simulation SQL error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SIM GOS server running on port ${PORT}`);
  });
}

startServer();
