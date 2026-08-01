<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('entry_type', 20)->nullable()->after('user_id');
            $table->string('lokasi')->nullable()->after('status');
            $table->string('desa')->nullable()->after('lokasi');
            $table->string('kecamatan')->nullable()->after('desa');
            $table->string('kabupaten')->nullable()->after('kecamatan');
            $table->string('nama_pengelola')->nullable()->after('kabupaten');
            $table->string('kontak_person')->nullable()->after('nama_pengelola');
            $table->string('no_wa', 30)->nullable()->after('kontak_person');
            $table->string('foto_kondisi_path')->nullable()->after('no_wa');
            $table->string('nama_pemilik')->nullable()->after('foto_kondisi_path');
            $table->string('penanggung_jawab')->nullable()->after('nama_pemilik');
            $table->decimal('kapasitas', 12, 2)->nullable()->after('penanggung_jawab');
            $table->string('sumber_pendanaan', 30)->nullable()->after('kapasitas');
            $table->string('sumber_pendanaan_detail')->nullable()->after('sumber_pendanaan');
            $table->unsignedSmallInteger('tahun_pembangunan')->nullable()->after('sumber_pendanaan_detail');
            $table->decimal('bauran_energi', 16, 6)->nullable()->after('tahun_pembangunan');

            $table->string('nama_pemohon')->nullable()->change();
            $table->string('nomor_identitas')->nullable()->change();
            $table->text('alamat_organisasi')->nullable()->change();
            $table->string('nama_ketua')->nullable()->change();

            $table->index('entry_type');
        });

        // Allow new category values (and null for potensi) while keeping legacy ones.
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE submissions MODIFY COLUMN category VARCHAR(50) NULL');
        } else {
            Schema::table('submissions', function (Blueprint $table) {
                $table->string('category', 50)->nullable()->change();
            });
        }

        // Existing rows stay null (legacy form); new inputs always set entry_type.
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropIndex(['entry_type']);
            $table->dropColumn([
                'entry_type',
                'lokasi',
                'desa',
                'kecamatan',
                'kabupaten',
                'nama_pengelola',
                'kontak_person',
                'no_wa',
                'foto_kondisi_path',
                'nama_pemilik',
                'penanggung_jawab',
                'kapasitas',
                'sumber_pendanaan',
                'sumber_pendanaan_detail',
                'tahun_pembangunan',
                'bauran_energi',
            ]);
        });
    }
};
